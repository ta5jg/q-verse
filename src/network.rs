use libp2p::{
    gossipsub, mdns, noise, swarm::{NetworkBehaviour, SwarmEvent}, tcp, yamux, PeerId, Swarm
};
use libp2p::futures::StreamExt;
use std::error::Error;
use std::time::Duration;
use tokio::sync::mpsc;

// --- Network Behaviour ---
// Bu yapı, düğümlerin (nodes) birbirini nasıl bulacağını ve konuşacağını belirler.
// USDTgVerse'deki statik IP listesi yerine, biz dinamik keşif (mDNS) ve Gossip (Dedikodu) protokolü kullanıyoruz.
#[derive(NetworkBehaviour)]
pub struct QVerseBehaviour {
    pub gossipsub: gossipsub::Behaviour,
    pub mdns: mdns::tokio::Behaviour,
}

pub struct P2PNode {
    pub swarm: Swarm<QVerseBehaviour>,
    pub command_receiver: mpsc::Receiver<String>,
}

impl P2PNode {
    pub async fn new(secret_key_seed: Option<u8>) -> Result<Self, Box<dyn Error>> {
        // 1. Kimlik Oluştur (Identity)
        let id_keys = libp2p::identity::Keypair::generate_ed25519();
        let peer_id = PeerId::from(id_keys.public());
        println!("🆔 Local Node ID: {}", peer_id);

        // 2. Transport Katmanı (TCP + Noise Encryption + Yamux Multiplexing)
        // Bu, USDTgVerse'nin C ile yazdığı socket katmanından çok daha güvenli ve modern.
        let transport = libp2p::tcp::tokio::Transport::new(tcp::Config::default().nodelay(true))
            .upgrade(libp2p::core::upgrade::Version::V1)
            .authenticate(noise::Config::new(&id_keys).unwrap())
            .multiplex(yamux::Config::default())
            .boxed();

        // 3. Gossipsub (Mesajlaşma)
        let message_id_fn = |message: &gossipsub::Message| {
            let mut s = std::collections::hash_map::DefaultHasher::new();
            use std::hash::{Hash, Hasher};
            message.data.hash(&mut s);
            gossipsub::MessageId::from(s.finish().to_string())
        };

        let gossipsub_config = gossipsub::ConfigBuilder::default()
            .heartbeat_interval(Duration::from_secs(1))
            .validation_mode(gossipsub::ValidationMode::Strict)
            .message_id_fn(message_id_fn)
            .build()
            .expect("Valid config");

        let gossipsub = gossipsub::Behaviour::new(
            gossipsub::MessageAuthenticity::Signed(id_keys),
            gossipsub_config,
        )?;

        // 4. mDNS (Yerel Ağ Keşfi)
        let mdns = mdns::tokio::Behaviour::new(mdns::Config::default(), peer_id)?;

        // 5. Swarm Oluştur
        let behaviour = QVerseBehaviour { gossipsub, mdns };
        let swarm = Swarm::new_with_tokio_executor(transport, behaviour, peer_id);
        
        let (cmd_tx, cmd_rx) = mpsc::channel(32);

        Ok(Self {
            swarm,
            command_receiver: cmd_rx,
        })
    }

    pub async fn start(&mut self) -> Result<(), Box<dyn Error>> {
        // 0.0.0.0 üzerinden dinle (Tüm IP'ler)
        self.swarm.listen_on("/ip4/0.0.0.0/tcp/0".parse()?)?;

        loop {
            tokio::select! {
                event = self.swarm.select_next_some() => match event {
                    SwarmEvent::NewListenAddr { address, .. } => {
                        println!("👂 Listening on {:?}", address);
                    }
                    SwarmEvent::Behaviour(QVerseBehaviourEvent::Mdns(mdns::Event::Discovered(list))) => {
                        for (peer_id, _multiaddr) in list {
                            println!("👋 Discovered new peer: {:?}", peer_id);
                            self.swarm.behaviour_mut().gossipsub.add_explicit_peer(&peer_id);
                        }
                    }
                    SwarmEvent::Behaviour(QVerseBehaviourEvent::Gossipsub(gossipsub::Event::Message { propagation_source, message_id, message })) => {
                        println!("📨 Received message from {:?}: {:?}", propagation_source, String::from_utf8_lossy(&message.data));
                        // Burada gelen Blok veya Transaction verisini işleyeceğiz.
                    }
                    _ => {}
                },
                _ = self.command_receiver.recv() => {
                    // Dışarıdan gelen komutları işle (Örn: Blok yayınla)
                }
            }
        }
    }
}

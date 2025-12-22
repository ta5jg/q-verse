use std::error::Error;
use uuid::Uuid;

/// Mobile Device Manager
pub struct MobileDeviceManager;

impl MobileDeviceManager {
    /// Register a mobile device for push notifications
    pub fn register_device(
        wallet_id: String,
        device_token: String,
        platform: String,
        app_version: Option<String>,
    ) -> MobileDevice {
        MobileDevice {
            id: Uuid::new_v4().to_string(),
            wallet_id,
            device_token,
            platform,
            app_version,
        }
    }

    /// Validate device token format
    pub fn validate_device_token(token: &str, platform: &str) -> Result<(), Box<dyn Error>> {
        match platform {
            "ios" => {
                if token.len() != 64 {
                    return Err("Invalid iOS device token format".into());
                }
            },
            "android" => {
                if token.len() < 100 {
                    return Err("Invalid Android FCM token format".into());
                }
            },
            _ => return Err("Unsupported platform".into()),
        }
        Ok(())
    }
}

#[derive(Debug, Clone, sqlx::FromRow, serde::Serialize, serde::Deserialize)]
pub struct MobileDevice {
    pub id: String,
    pub wallet_id: String,
    pub device_token: String,
    pub platform: String,
    pub app_version: Option<String>,
}

/// Push Notification Service
pub struct PushNotificationService;

impl PushNotificationService {
    /// Create a push notification
    pub fn create_notification(
        device_id: String,
        title: String,
        body: String,
        data: Option<serde_json::Value>,
    ) -> PushNotification {
        PushNotification {
            id: Uuid::new_v4().to_string(),
            device_id,
            title,
            body,
            data,
            status: "PENDING".to_string(),
        }
    }

    /// Format notification for iOS (APNs)
    pub fn format_ios_notification(notification: &PushNotification) -> String {
        serde_json::json!({
            "aps": {
                "alert": {
                    "title": notification.title,
                    "body": notification.body
                },
                "sound": "default",
                "badge": 1
            },
            "data": notification.data
        }).to_string()
    }

    /// Format notification for Android (FCM)
    pub fn format_android_notification(notification: &PushNotification) -> String {
        serde_json::json!({
            "notification": {
                "title": notification.title,
                "body": notification.body,
                "sound": "default"
            },
            "data": notification.data
        }).to_string()
    }
}

#[derive(Debug, Clone)]
pub struct PushNotification {
    pub id: String,
    pub device_id: String,
    pub title: String,
    pub body: String,
    pub data: Option<serde_json::Value>,
    pub status: String,
}

/// Biometric Authentication Manager
pub struct BiometricAuthManager;

impl BiometricAuthManager {
    /// Enable biometric authentication for wallet
    pub fn enable_biometric(
        wallet_id: String,
        biometric_type: String,
        public_key: String,
    ) -> BiometricAuth {
        BiometricAuth {
            id: Uuid::new_v4().to_string(),
            wallet_id,
            biometric_type,
            public_key,
            is_enabled: true,
        }
    }

    /// Verify biometric challenge
    pub fn verify_biometric(
        challenge: &str,
        signature: &str,
        public_key: &str,
    ) -> Result<bool, Box<dyn Error>> {
        // In production, use actual biometric verification
        // For now, simple validation
        if challenge.is_empty() || signature.is_empty() {
            return Err("Invalid challenge or signature".into());
        }
        Ok(true)
    }
}

#[derive(Debug, Clone)]
pub struct BiometricAuth {
    pub id: String,
    pub wallet_id: String,
    pub biometric_type: String,
    pub public_key: String,
    pub is_enabled: bool,
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_device_registration() {
        let device = MobileDeviceManager::register_device(
            "wallet1".to_string(),
            "test_token".to_string(),
            "ios".to_string(),
            Some("1.0.0".to_string()),
        );
        assert_eq!(device.platform, "ios");
    }
}

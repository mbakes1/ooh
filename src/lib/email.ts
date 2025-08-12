// Email notification service
// This is a placeholder implementation that logs to console
// In production, you would integrate with services like SendGrid, Resend, or AWS SES

interface EmailNotificationData {
  to: string;
  recipientName: string;
  senderName: string;
  messageContent: string;
  billboardTitle?: string;
  conversationUrl: string;
}

export async function sendMessageNotification(data: EmailNotificationData) {
  try {
    // TODO: Replace with actual email service implementation
    console.log("📧 Email notification would be sent:", {
      to: data.to,
      subject: `New message from ${data.senderName}`,
      content: `
        Hi ${data.recipientName},
        
        You have received a new message from ${data.senderName}${
          data.billboardTitle ? ` regarding "${data.billboardTitle}"` : ""
        }.
        
        Message: "${data.messageContent.substring(0, 100)}${
          data.messageContent.length > 100 ? "..." : ""
        }"
        
        View the full conversation: ${data.conversationUrl}
        
        Best regards,
        Digital Billboard Marketplace Team
      `,
    });

    // Simulate email sending delay
    await new Promise((resolve) => setTimeout(resolve, 100));

    return { success: true };
  } catch (error) {
    console.error("Failed to send email notification:", error);
    return { success: false, error };
  }
}

export async function sendConversationStartedNotification(
  data: EmailNotificationData
) {
  try {
    // TODO: Replace with actual email service implementation
    console.log("📧 Conversation started email would be sent:", {
      to: data.to,
      subject: `New inquiry about ${data.billboardTitle}`,
      content: `
        Hi ${data.recipientName},
        
        You have received a new inquiry from ${data.senderName} about your billboard "${data.billboardTitle}".
        
        Message: "${data.messageContent.substring(0, 200)}${
          data.messageContent.length > 200 ? "..." : ""
        }"
        
        Respond to this inquiry: ${data.conversationUrl}
        
        Best regards,
        Digital Billboard Marketplace Team
      `,
    });

    // Simulate email sending delay
    await new Promise((resolve) => setTimeout(resolve, 100));

    return { success: true };
  } catch (error) {
    console.error("Failed to send conversation started notification:", error);
    return { success: false, error };
  }
}

// Email templates for different notification types
export const EMAIL_TEMPLATES = {
  NEW_MESSAGE: "new_message",
  CONVERSATION_STARTED: "conversation_started",
  MESSAGE_REPLY: "message_reply",
} as const;

// Email service configuration
export const EMAIL_CONFIG = {
  FROM_EMAIL: process.env.FROM_EMAIL || "noreply@billboardmarketplace.co.za",
  FROM_NAME: process.env.FROM_NAME || "Digital Billboard Marketplace",
  REPLY_TO: process.env.REPLY_TO_EMAIL || "support@billboardmarketplace.co.za",
} as const;

/**
 * Email service utility for sending magic link emails
 * Works without any external dependencies - uses console logging in development
 * For production, optionally configure Resend or another email service
 */

interface SendEmailOptions {
	to: string;
	subject: string;
	html: string;
	from?: string;
}

/**
 * Extract magic link URL from HTML content
 */
function extractMagicLinkUrl(html: string): string | null {
	const urlMatch = html.match(/href="([^"]+)"/);
	return urlMatch ? urlMatch[1] : null;
}

/**
 * Send email using configured email service
 * No external dependencies required - works in development mode with console logging
 */
export async function sendEmail({ to, subject, html, from }: SendEmailOptions): Promise<void> {
	const emailFrom = from || process.env.EMAIL_FROM || '[email protected]';

	// Try Resend first (if API key is configured - optional)
	if (process.env.RESEND_API_KEY) {
		try {
			const resend = await import('resend');
			const resendClient = new resend.Resend(process.env.RESEND_API_KEY);

			await resendClient.emails.send({
				from: emailFrom,
				to,
				subject,
				html,
			});

			console.log(`[Email] Magic link sent to ${to} via Resend`);
			return;
		} catch (error) {
			console.error('[Email] Resend error:', error);
			// Fall through to console fallback
		}
	}

	// Development/fallback: Log to console (no dependencies required)
	const magicLinkUrl = extractMagicLinkUrl(html);

	console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
	console.log('📧 MAGIC LINK EMAIL (Development Mode)');
	console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
	console.log(`To: ${to}`);
	console.log(`From: ${emailFrom}`);
	console.log(`Subject: ${subject}`);
	console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

	if (magicLinkUrl) {
		console.log('\n🔗 MAGIC LINK URL (click or copy this):');
		console.log(magicLinkUrl);
		console.log('\n');
	}

	console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

	// In production without email service, log warning but don't throw
	// This allows the app to work, but emails won't be sent
	if (process.env.NODE_ENV === 'production' && !process.env.RESEND_API_KEY) {
		console.warn(
			'⚠️  [Email] Running in production without email service configured.\n' +
			'   Magic links are logged to console. Configure RESEND_API_KEY for production emails.'
		);
	}
}

/**
 * Generate HTML email template for magic link
 */
export function generateMagicLinkEmail(url: string, expiresInMinutes: number = 10): string {
	return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Sign in to Spicy TV</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 28px;">Spicy TV</h1>
  </div>

  <div style="background: #ffffff; padding: 40px; border-radius: 0 0 10px 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
    <h2 style="color: #333; margin-top: 0;">Sign in to your account</h2>
    <p style="color: #666; font-size: 16px;">Click the button below to sign in to your Spicy TV account. This link will expire in ${expiresInMinutes} minutes.</p>

    <div style="text-align: center; margin: 30px 0;">
      <a href="${url}" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px;">Sign In</a>
    </div>

    <p style="color: #999; font-size: 14px; margin-top: 30px;">If the button doesn't work, copy and paste this link into your browser:</p>
    <p style="color: #667eea; font-size: 12px; word-break: break-all; background: #f5f5f5; padding: 10px; border-radius: 4px;">${url}</p>

    <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">

    <p style="color: #999; font-size: 12px; margin: 0;">If you didn't request this link, you can safely ignore this email.</p>
  </div>
</body>
</html>
  `.trim();
}

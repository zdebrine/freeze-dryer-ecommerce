// Email template utility functions

interface ShippingAddress {
  line1: string
  line2?: string
  city: string
  state: string
  postalCode: string
}

export function getOrderConfirmationEmail(clientName: string, orderNumber: string, shippingAddress: ShippingAddress) {
  const subject = `Order Confirmation - ${orderNumber}`

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #8B5CF6; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9f9f9; }
          .address-box { background: white; padding: 15px; border-left: 4px solid #8B5CF6; margin: 20px 0; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Order Confirmed!</h1>
          </div>
          <div class="content">
            <p>Hello ${clientName},</p>
            <p>Your order <strong>${orderNumber}</strong> has been confirmed and is ready for processing.</p>
            
            <div class="address-box">
              <h3>Ship Your Coffee To:</h3>
              <p>
                ${shippingAddress.line1}<br>
                ${shippingAddress.line2 ? `${shippingAddress.line2}<br>` : ""}
                ${shippingAddress.city}, ${shippingAddress.state} ${shippingAddress.postalCode}
              </p>
            </div>
            
            <p>We'll notify you once we receive your package and begin processing.</p>
          </div>
          <div class="footer">
            <p>Thank you for choosing our freeze-drying service!</p>
          </div>
        </div>
      </body>
    </html>
  `

  const text = `Order Confirmation - ${orderNumber}\n\nHello ${clientName},\n\nYour order ${orderNumber} has been confirmed. Please ship your coffee to:\n${shippingAddress.line1}\n${shippingAddress.line2 ? shippingAddress.line2 + "\n" : ""}${shippingAddress.city}, ${shippingAddress.state} ${shippingAddress.postalCode}\n\nWe'll notify you once we receive your package.`

  return { subject, html, text }
}

export function getTeamInvitationEmail(inviteeName: string, inviterName: string, inviteLink: string) {
  const subject = `You've been invited to join the team`

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #8B5CF6; color: white; padding: 30px; text-align: center; }
          .content { padding: 30px; background: #f9f9f9; }
          .button { display: inline-block; padding: 12px 30px; background: #8B5CF6; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0; }
          .permissions { background: white; padding: 20px; border-radius: 6px; margin: 20px 0; }
          .permissions ul { list-style: none; padding: 0; }
          .permissions li { padding: 8px 0; border-bottom: 1px solid #eee; }
          .permissions li:last-child { border-bottom: none; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; }
          .expires { background: #FEF3C7; padding: 10px; border-radius: 6px; margin: 20px 0; color: #92400E; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 Team Invitation</h1>
          </div>
          <div class="content">
            <p>Hello ${inviteeName},</p>
            <p><strong>${inviterName}</strong> has invited you to join their team as an employee.</p>
            
            <div class="permissions">
              <h3>Your Role & Permissions</h3>
              <p>As an employee, you'll be able to:</p>
              <ul>
                <li>✓ View and update orders</li>
                <li>✓ Sign off on freeze-drying process stages</li>
                <li>✓ Track order progress and history</li>
                <li>✓ Input weight measurements during processing</li>
              </ul>
              <p style="margin-top: 15px;"><em>Note: Only admins can create invoices and mark orders as completed.</em></p>
            </div>
            
            <div style="text-align: center;">
              <a href="${inviteLink}" class="button">Accept Invitation</a>
            </div>
            
            <div class="expires">
              <strong>⏰ This invitation expires in 7 days</strong>
            </div>
            
            <p>If you have any questions, please reach out to ${inviterName}.</p>
          </div>
          <div class="footer">
            <p>If you weren't expecting this invitation, you can safely ignore this email.</p>
          </div>
        </div>
      </body>
    </html>
  `

  const text = `Team Invitation\n\nHello ${inviteeName},\n\n${inviterName} has invited you to join their team as an employee.\n\nYour Role & Permissions:\n- View and update orders\n- Sign off on freeze-drying process stages\n- Track order progress and history\n- Input weight measurements during processing\n\nNote: Only admins can create invoices and mark orders as completed.\n\nAccept your invitation here:\n${inviteLink}\n\nThis invitation expires in 7 days.\n\nIf you have any questions, please reach out to ${inviterName}.`

  return { subject, html, text }
}

export function getPackageReceivedEmail(clientName: string, orderNumber: string) {
  const subject = `Package Received - ${orderNumber}`

  const html = `
    <!DOCTYPE html>
    <html>
      <body style="font-family: Arial, sans-serif;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2>Package Received!</h2>
          <p>Hello ${clientName},</p>
          <p>We've received your package for order <strong>${orderNumber}</strong> and it's now in our facility.</p>
          <p>We'll begin processing your coffee soon and keep you updated on its progress.</p>
        </div>
      </body>
    </html>
  `

  const text = `Package Received - ${orderNumber}\n\nHello ${clientName},\n\nWe've received your package for order ${orderNumber} and it's now in our facility. We'll begin processing your coffee soon.`

  return { subject, html, text }
}

export function getProcessingStageEmail(clientName: string, orderNumber: string, stage: string, description: string) {
  const subject = `Order Update: ${stage} - ${orderNumber}`

  const html = `
    <!DOCTYPE html>
    <html>
      <body style="font-family: Arial, sans-serif;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2>Order Update</h2>
          <p>Hello ${clientName},</p>
          <p>Your order <strong>${orderNumber}</strong> has moved to: <strong>${stage}</strong></p>
          <p>${description}</p>
        </div>
      </body>
    </html>
  `

  const text = `Order Update: ${stage} - ${orderNumber}\n\nHello ${clientName},\n\nYour order ${orderNumber} has moved to: ${stage}\n\n${description}`

  return { subject, html, text }
}

export function getPaymentReadyEmail(clientName: string, orderNumber: string, checkoutUrl: string, quantityKg: number) {
  const subject = `Payment Ready - ${orderNumber}`

  const html = `
    <!DOCTYPE html>
    <html>
      <body style="font-family: Arial, sans-serif;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2>Your Order is Ready for Payment</h2>
          <p>Hello ${clientName},</p>
          <p>Great news! Your order <strong>${orderNumber}</strong> (${quantityKg}kg) has been processed and is ready for payment.</p>
          <p style="text-align: center; margin: 30px 0;">
            <a href="${checkoutUrl}" style="background: #8B5CF6; color: white; padding: 15px 30px; text-decoration: none; border-radius: 6px; display: inline-block;">Complete Payment</a>
          </p>
        </div>
      </body>
    </html>
  `

  const text = `Payment Ready - ${orderNumber}\n\nHello ${clientName},\n\nYour order ${orderNumber} (${quantityKg}kg) has been processed and is ready for payment.\n\nComplete payment here: ${checkoutUrl}`

  return { subject, html, text }
}

export function getPaymentConfirmedEmail(clientName: string, orderNumber: string, trackingNumber?: string) {
  const subject = `Payment Confirmed - ${orderNumber}`

  const trackingInfo = trackingNumber
    ? `<p>Your tracking number: <strong>${trackingNumber}</strong></p>`
    : `<p>We'll send you tracking information once your order ships.</p>`

  const html = `
    <!DOCTYPE html>
    <html>
      <body style="font-family: Arial, sans-serif;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2>Payment Confirmed!</h2>
          <p>Hello ${clientName},</p>
          <p>Thank you! We've received payment for order <strong>${orderNumber}</strong>.</p>
          ${trackingInfo}
        </div>
      </body>
    </html>
  `

  const text = `Payment Confirmed - ${orderNumber}\n\nHello ${clientName},\n\nThank you! We've received payment for order ${orderNumber}.\n${trackingNumber ? `Your tracking number: ${trackingNumber}` : `We'll send you tracking information once your order ships.`}`

  return { subject, html, text }
}

export function getTrackingSubmittedEmail(
  adminName: string,
  orderNumber: string,
  clientName: string,
  trackingNumber: string,
) {
  const subject = `Tracking Submitted - ${orderNumber}`

  const html = `
    <!DOCTYPE html>
    <html>
      <body style="font-family: Arial, sans-serif;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2>Tracking Number Submitted</h2>
          <p>Hello ${adminName},</p>
          <p>${clientName} has submitted tracking number <strong>${trackingNumber}</strong> for order <strong>${orderNumber}</strong>.</p>
          <p>You can now track the incoming shipment.</p>
        </div>
      </body>
    </html>
  `

  const text = `Tracking Submitted - ${orderNumber}\n\nHello ${adminName},\n\n${clientName} has submitted tracking number ${trackingNumber} for order ${orderNumber}.\n\nYou can now track the incoming shipment.`

  return { subject, html, text }
}

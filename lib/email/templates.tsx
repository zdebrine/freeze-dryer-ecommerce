export function getOrderConfirmationEmail(
  clientName: string,
  orderNumber: string,
  adminShippingAddress: {
    line1: string
    line2?: string
    city: string
    state: string
    postalCode: string
  },
) {
  const subject = `Order ${orderNumber} Confirmed - Ship Your Coffee`

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h1 style="color: #333; border-bottom: 2px solid #4CAF50; padding-bottom: 10px;">Order Confirmed!</h1>
      <p style="font-size: 16px; color: #555;">Hi ${clientName},</p>
      <p style="font-size: 16px; color: #555;">
        Great news! Your order <strong>${orderNumber}</strong> has been confirmed and is ready for processing.
      </p>
      <p style="font-size: 16px; color: #555;">
        Please ship your coffee to the address below. Once shipped, remember to submit your tracking number through your dashboard.
      </p>
      <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h2 style="color: #333; margin-top: 0;">Ship To:</h2>
        <p style="margin: 5px 0; color: #555;">${adminShippingAddress.line1}</p>
        ${adminShippingAddress.line2 ? `<p style="margin: 5px 0; color: #555;">${adminShippingAddress.line2}</p>` : ""}
        <p style="margin: 5px 0; color: #555;">${adminShippingAddress.city}, ${adminShippingAddress.state} ${adminShippingAddress.postalCode}</p>
      </div>
      <p style="font-size: 14px; color: #777; margin-top: 30px;">
        Thank you for choosing our freeze-drying service!
      </p>
    </div>
  `

  const text = `Order ${orderNumber} Confirmed

Hi ${clientName},

Great news! Your order ${orderNumber} has been confirmed and is ready for processing.

Please ship your coffee to:
${adminShippingAddress.line1}
${adminShippingAddress.line2 || ""}
${adminShippingAddress.city}, ${adminShippingAddress.state} ${adminShippingAddress.postalCode}

Once shipped, remember to submit your tracking number through your dashboard.

Thank you for choosing our freeze-drying service!`

  return { subject, html, text }
}

export function getPackageReceivedEmail(clientName: string, orderNumber: string) {
  const subject = `Package Received for Order ${orderNumber}`

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h1 style="color: #333; border-bottom: 2px solid #4CAF50; padding-bottom: 10px;">Package Received!</h1>
      <p style="font-size: 16px; color: #555;">Hi ${clientName},</p>
      <p style="font-size: 16px; color: #555;">
        We've received your coffee for order <strong>${orderNumber}</strong> and it's now being prepared for freeze-drying.
      </p>
      <p style="font-size: 16px; color: #555;">
        We'll keep you updated as your order progresses through each stage of the freeze-drying process.
      </p>
      <p style="font-size: 14px; color: #777; margin-top: 30px;">
        Thank you for your patience!
      </p>
    </div>
  `

  const text = `Package Received for Order ${orderNumber}

Hi ${clientName},

We've received your coffee for order ${orderNumber} and it's now being prepared for freeze-drying.

We'll keep you updated as your order progresses through each stage of the freeze-drying process.

Thank you for your patience!`

  return { subject, html, text }
}

export function getProcessingStageEmail(clientName: string, orderNumber: string, stage: string, description: string) {
  const stageNames: Record<string, string> = {
    pre_freeze: "Pre-Freeze Preparation",
    freezing: "Freeze-Drying in Progress",
    post_freeze: "Post-Freeze Processing",
    packaging: "Final Packaging",
  }

  const subject = `Order ${orderNumber} Update: ${stageNames[stage] || stage}`

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h1 style="color: #333; border-bottom: 2px solid #4CAF50; padding-bottom: 10px;">Order Update</h1>
      <p style="font-size: 16px; color: #555;">Hi ${clientName},</p>
      <p style="font-size: 16px; color: #555;">
        Your order <strong>${orderNumber}</strong> has progressed to: <strong>${stageNames[stage] || stage}</strong>
      </p>
      <div style="background-color: #f5f5f5; padding: 15px; border-radius: 8px; margin: 20px 0;">
        <p style="margin: 0; color: #555; font-size: 15px;">${description}</p>
      </div>
      <p style="font-size: 14px; color: #777; margin-top: 30px;">
        We'll notify you when your order moves to the next stage.
      </p>
    </div>
  `

  const text = `Order ${orderNumber} Update: ${stageNames[stage] || stage}

Hi ${clientName},

Your order ${orderNumber} has progressed to: ${stageNames[stage] || stage}

${description}

We'll notify you when your order moves to the next stage.`

  return { subject, html, text }
}

export function getPaymentReadyEmail(clientName: string, orderNumber: string, checkoutUrl: string, quantityKg: number) {
  const subject = `Payment Ready for Order ${orderNumber}`

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h1 style="color: #333; border-bottom: 2px solid #4CAF50; padding-bottom: 10px;">Payment Ready!</h1>
      <p style="font-size: 16px; color: #555;">Hi ${clientName},</p>
      <p style="font-size: 16px; color: #555;">
        Great news! Your order <strong>${orderNumber}</strong> (${quantityKg}kg) has been freeze-dried and is ready for payment.
      </p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${checkoutUrl}" style="display: inline-block; background-color: #4CAF50; color: white; padding: 15px 40px; text-decoration: none; border-radius: 5px; font-size: 18px; font-weight: bold;">
          Complete Payment
        </a>
      </div>
      <p style="font-size: 16px; color: #555;">
        Once payment is confirmed, we'll prepare your order for shipment and provide tracking information.
      </p>
      <p style="font-size: 14px; color: #777; margin-top: 30px;">
        Thank you for your business!
      </p>
    </div>
  `

  const text = `Payment Ready for Order ${orderNumber}

Hi ${clientName},

Great news! Your order ${orderNumber} (${quantityKg}kg) has been freeze-dried and is ready for payment.

Complete payment here: ${checkoutUrl}

Once payment is confirmed, we'll prepare your order for shipment and provide tracking information.

Thank you for your business!`

  return { subject, html, text }
}

export function getPaymentConfirmedEmail(clientName: string, orderNumber: string, trackingNumber?: string) {
  const subject = `Payment Confirmed for Order ${orderNumber}`

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h1 style="color: #333; border-bottom: 2px solid #4CAF50; padding-bottom: 10px;">Payment Confirmed!</h1>
      <p style="font-size: 16px; color: #555;">Hi ${clientName},</p>
      <p style="font-size: 16px; color: #555;">
        Thank you! Your payment for order <strong>${orderNumber}</strong> has been confirmed.
      </p>
      ${
        trackingNumber
          ? `
      <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h2 style="color: #333; margin-top: 0;">Tracking Information</h2>
        <p style="margin: 5px 0; color: #555; font-size: 18px;"><strong>${trackingNumber}</strong></p>
      </div>
      <p style="font-size: 16px; color: #555;">
        Your order is being prepared for shipment. You can track your package using the number above.
      </p>
      `
          : `
      <p style="font-size: 16px; color: #555;">
        Your order is being prepared for shipment. We'll send you tracking information as soon as it's available.
      </p>
      `
      }
      <p style="font-size: 14px; color: #777; margin-top: 30px;">
        Thank you for choosing our service!
      </p>
    </div>
  `

  const text = `Payment Confirmed for Order ${orderNumber}

Hi ${clientName},

Thank you! Your payment for order ${orderNumber} has been confirmed.

${trackingNumber ? `Tracking Number: ${trackingNumber}\n\nYou can track your package using the number above.` : "We'll send you tracking information as soon as it's available."}

Thank you for choosing our service!`

  return { subject, html, text }
}

export function getTrackingSubmittedEmail(
  adminName: string,
  orderNumber: string,
  clientName: string,
  trackingNumber: string,
) {
  const subject = `Tracking Number Submitted for Order ${orderNumber}`

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h1 style="color: #333; border-bottom: 2px solid #2196F3; padding-bottom: 10px;">Tracking Number Received</h1>
      <p style="font-size: 16px; color: #555;">Hi ${adminName},</p>
      <p style="font-size: 16px; color: #555;">
        ${clientName} has submitted tracking information for order <strong>${orderNumber}</strong>.
      </p>
      <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h2 style="color: #333; margin-top: 0;">Tracking Number</h2>
        <p style="margin: 5px 0; color: #555; font-size: 18px;"><strong>${trackingNumber}</strong></p>
      </div>
      <p style="font-size: 16px; color: #555;">
        You can view the full order details in your admin dashboard.
      </p>
      <p style="font-size: 14px; color: #777; margin-top: 30px;">
        This is an automated notification from your order management system.
      </p>
    </div>
  `

  const text = `Tracking Number Received for Order ${orderNumber}

Hi ${adminName},

${clientName} has submitted tracking information for order ${orderNumber}.

Tracking Number: ${trackingNumber}

You can view the full order details in your admin dashboard.`

  return { subject, html, text }
}

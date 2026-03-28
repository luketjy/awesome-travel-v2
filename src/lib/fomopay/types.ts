export type FomoOrderStatus =
  | 'CREATED'
  | 'FAIL'
  | 'ERROR'
  | 'SUCCESS'
  | 'REFUND'
  | 'CLOSED'

export interface FomoHostedOrderSuccess {
  id: string
  orderNo: string
  mode: string
  subject: string
  amount: string
  currencyCode: string
  status: FomoOrderStatus
  url: string
}

export interface FomoErrorBody {
  hint: string
  message: string
}

export interface FomoWebhookPayload {
  orderId: string
  orderNo: string
  transactionId: string
  transactionNo?: string
}

package dto

type CreateOrderInput struct {
	// Order is created from the user's cart; no body needed.
}

type UpdateOrderStatusInput struct {
	Status string `json:"status" binding:"required"`
}

type CreatePaymentInput struct {
	Method string `json:"method" binding:"required"`
}

type UpdatePaymentStatusInput struct {
	Status string `json:"status" binding:"required"`
}

type CreateDeliveryInput struct {
	Address string `json:"address" binding:"required"`
}

type UpdateDeliveryStatusInput struct {
	Status string `json:"status" binding:"required"`
}

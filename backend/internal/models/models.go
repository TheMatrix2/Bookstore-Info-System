package models

import (
	"time"

	"github.com/google/uuid"
	"github.com/uptrace/bun"
)

type Role struct {
	bun.BaseModel `bun:"table:roles"`

	ID   	uuid.UUID 	`bun:",pk,type:uuid,default:uuid_generate_v4()"`
	Name 	string    	`bun:",unique,notnull"`

	Users 	[]*User 	`bun:"rel:has-many,join:id=role_id"`
}

type User struct {
	bun.BaseModel `bun:"table:users"`

	ID				uuid.UUID 	`bun:",pk,type:uuid,default:uuid_generate_v4()"`
	Username     	string    	`bun:",unique,notnull"`
	Email        	string    	`bun:",unique,notnull"`
	Phone        	*string
	PasswordHash 	string    	`bun:",notnull"`
	RoleID       	uuid.UUID	`bun:",type:uuid,notnull"`

	Role   			*Role   	`bun:"rel:belongs-to,join:role_id=id"`
	Cart   			*Cart   	`bun:"rel:has-one,join:id=user_id"`
	Orders 			[]*Order 	`bun:"rel:has-many,join:id=user_id"`
}

type Author struct {
	bun.BaseModel `bun:"table:authors"`

	ID         	uuid.UUID 	`bun:",pk,type:uuid,default:uuid_generate_v4()"`
	Surname    	string    	`bun:",notnull"`
	Name       	string    	`bun:",notnull"`
	Patronymic 	string    	`bun:",notnull"`

	Books 		[]*Book 	`bun:"rel:has-many,join:id=author_id"`
}

type Publisher struct {
	bun.BaseModel `bun:"table:publishers"`

	ID      uuid.UUID 	`bun:",pk,type:uuid,default:uuid_generate_v4()"`
	Name    string    	`bun:",unique,notnull"`
	Address	string    	`bun:",notnull"`

	Books 	[]*Book 	`bun:"rel:has-many,join:id=publisher_id"`
}

type Category struct {
	bun.BaseModel `bun:"table:categories"`

	ID   	uuid.UUID 	`bun:",pk,type:uuid,default:uuid_generate_v4()"`
	Name 	string    	`bun:",notnull"`

	Books 	[]*Book 	`bun:"m2m:book_categories,join:Category=Book"`
}

type Book struct {
	bun.BaseModel `bun:"table:books"`

	ID          	uuid.UUID 		`bun:",pk,type:uuid,default:uuid_generate_v4()"`
	Title       	string    		`bun:",notnull"`
	Description 	*string
	Price       	float64   		`bun:",notnull,default:0"`
	Stock       	int       		`bun:",notnull,default:0"`

	AuthorID    	uuid.UUID 		`bun:",type:uuid,notnull"`
	PublisherID 	uuid.UUID 		`bun:",type:uuid,notnull"`

	CreatedAt 		time.Time 		`bun:",nullzero,notnull,default:current_timestamp"`
	UpdatedAt 		time.Time 		`bun:",nullzero,notnull,default:current_timestamp"`

	Author    		*Author     	`bun:"rel:belongs-to,join:author_id=id"`
	Publisher 		*Publisher 		`bun:"rel:belongs-to,join:publisher_id=id"`
	Categories 		[]*Category 	`bun:"m2m:book_categories,join:Book=Category"`

	CartItems  		[]*CartItem  	`bun:"rel:has-many,join:id=book_id"`
	OrderItems 		[]*OrderItem 	`bun:"rel:has-many,join:id=book_id"`
}

type BookCategory struct {
	bun.BaseModel `bun:"table:book_categories"`

	BookID     	uuid.UUID 	`bun:",pk,type:uuid"`
	CategoryID 	uuid.UUID 	`bun:",pk,type:uuid"`
}

type Cart struct {
	bun.BaseModel `bun:"table:carts"`

	ID     	uuid.UUID 	`bun:",pk,type:uuid,default:uuid_generate_v4()"`
	UserID 	uuid.UUID 	`bun:",type:uuid,notnull,unique"`

	User  	*User      	`bun:"rel:belongs-to,join:user_id=id"`
	Items 	[]*CartItem `bun:"rel:has-many,join:id=cart_id"`
}

type CartItem struct {
	bun.BaseModel `bun:"table:cart_items"`

	ID       	uuid.UUID 	`bun:",pk,type:uuid,default:uuid_generate_v4()"`
	CartID   	uuid.UUID 	`bun:",type:uuid,notnull"`
	BookID   	uuid.UUID 	`bun:",type:uuid,notnull"`
	Quantity 	int       	`bun:",notnull,default:1"`

	Cart 		*Cart 		`bun:"rel:belongs-to,join:cart_id=id"`
	Book 		*Book 		`bun:"rel:belongs-to,join:book_id=id"`
}

type Order struct {
	bun.BaseModel `bun:"table:orders"`

	ID         	uuid.UUID 		`bun:",pk,type:uuid,default:uuid_generate_v4()"`
	UserID     	uuid.UUID 		`bun:",type:uuid,notnull"`
	TotalPrice 	float64   		`bun:",notnull,default:0"`
	Status     	string    		`bun:",notnull,default:'New'"`

	CreatedAt 	time.Time 		`bun:",nullzero,notnull,default:current_timestamp"`
	UpdatedAt 	time.Time 		`bun:",nullzero,notnull,default:current_timestamp"`

	User      	*User        	`bun:"rel:belongs-to,join:user_id=id"`
	Items     	[]*OrderItem 	`bun:"rel:has-many,join:id=order_id"`
	Payment  	*Payment     	`bun:"rel:has-one,join:id=order_id"`
	Delivery  	*Delivery    	`bun:"rel:has-one,join:id=order_id"`
}

type OrderItem struct {
	bun.BaseModel `bun:"table:order_items"`

	ID       	uuid.UUID 	`bun:",pk,type:uuid,default:uuid_generate_v4()"`
	OrderID  	uuid.UUID 	`bun:",type:uuid,notnull"`
	BookID   	uuid.UUID 	`bun:",type:uuid,notnull"`
	Quantity 	int       	`bun:",notnull,default:1"`

	Order 		*Order 		`bun:"rel:belongs-to,join:order_id=id"`
	Book  		*Book  		`bun:"rel:belongs-to,join:book_id=id"`
}

type Payment struct {
	bun.BaseModel `bun:"table:payments"`

	ID      	uuid.UUID 	`bun:",pk,type:uuid,default:uuid_generate_v4()"`
	OrderID 	uuid.UUID 	`bun:",type:uuid,notnull,unique"`
	Amount  	float64   	`bun:",notnull"`
	Method  	string    	`bun:",notnull"`
	Status  	string    	`bun:",notnull,default:'Not paid'"`

	CreatedAt 	time.Time 	`bun:",nullzero,notnull,default:current_timestamp"`
	UpdatedAt 	time.Time 	`bun:",nullzero,notnull,default:current_timestamp"`

	Order 		*Order 		`bun:"rel:belongs-to,join:order_id=id"`
}

type Delivery struct {
	bun.BaseModel `bun:"table:deliveries"`

	OrderID 	uuid.UUID 	`bun:",pk,type:uuid"`
	Address 	string    	`bun:",notnull"`
	Status  	string    	`bun:",notnull,default:'Waiting'"`

	CreatedAt 	time.Time 	`bun:",nullzero,notnull,default:current_timestamp"`
	UpdatedAt 	time.Time 	`bun:",nullzero,notnull,default:current_timestamp"`

	Order 		*Order 		`bun:"rel:belongs-to,join:order_id=id"`
}
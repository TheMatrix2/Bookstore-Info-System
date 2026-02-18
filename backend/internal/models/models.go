package models

import (
	"time"

	"github.com/google/uuid"
	"github.com/uptrace/bun"
)

type Role struct {
	bun.BaseModel `bun:"table:roles"`

	ID   	uuid.UUID 	`bun:"id,pk,type:uuid,default:gen_random_uuid()"`
	Name 	string    	`bun:"name,unique,notnull"`

	Users 	[]*User 	`bun:"rel:has-many,join:id=role_id"`
}

type User struct {
	bun.BaseModel `bun:"table:users"`

	ID				uuid.UUID 	`bun:"id,pk,type:uuid,default:gen_random_uuid()"`
	Username     	string    	`bun:"username,unique,notnull"`
	Email        	string    	`bun:"email,unique,notnull"`
	Phone        	*string
	PasswordHash 	string    	`bun:"password_hash,notnull"`
	RoleID       	uuid.UUID	`bun:"role_id,type:uuid,notnull"`

	Role   			*Role   	`bun:"rel:belongs-to,join:role_id=id"`
	Cart   			*Cart   	`bun:"rel:has-one,join:id=user_id"`
	Orders 			[]*Order 	`bun:"rel:has-many,join:id=user_id"`
}

type Author struct {
	bun.BaseModel `bun:"table:authors"`

	ID         	uuid.UUID 	`bun:"id,pk,type:uuid,default:gen_random_uuid()"`
	Surname    	string    	`bun:"surname,notnull"`
	Name       	string    	`bun:"name,notnull"`
	Patronymic 	string    	`bun:"patronymic,notnull"`

	Books 		[]*Book 	`bun:"rel:has-many,join:id=author_id"`
}

type Publisher struct {
	bun.BaseModel `bun:"table:publishers"`

	ID      uuid.UUID 	`bun:"id,pk,type:uuid,default:gen_random_uuid()"`
	Name    string    	`bun:"name,unique,notnull"`
	Address	string    	`bun:"address,notnull"`

	Books 	[]*Book 	`bun:"rel:has-many,join:id=publisher_id"`
}

type Category struct {
	bun.BaseModel `bun:"table:categories"`

	ID   	uuid.UUID 	`bun:"id,pk,type:uuid,default:gen_random_uuid()"`
	Name 	string    	`bun:"name,notnull"`

	Books 	[]*Book 	`bun:"m2m:book_to_category,join:Category=Book"`
}

type Book struct {
	bun.BaseModel `bun:"table:books"`

	ID          	uuid.UUID 		`bun:"id,pk,type:uuid,default:gen_random_uuid()"`
	Title       	string    		`bun:"title,notnull"`
	Description 	*string
	Price       	float64   		`bun:"price,notnull,default:0"`
	Stock       	int       		`bun:"stock,notnull,default:0"`

	AuthorID    	uuid.UUID 		`bun:"author_id,type:uuid,notnull"`
	PublisherID 	uuid.UUID 		`bun:"publisher_id,type:uuid,notnull"`

	CreatedAt 		time.Time 		`bun:"created_at,nullzero,notnull,default:current_timestamp"`
	UpdatedAt 		time.Time 		`bun:"updated_at,nullzero,notnull,default:current_timestamp"`

	Author    		*Author     	`bun:"rel:belongs-to,join:author_id=id"`
	Publisher 		*Publisher 		`bun:"rel:belongs-to,join:publisher_id=id"`
	Categories 		[]*Category 	`bun:"m2m:book_to_category,join:Book=Category"`

	CartItems  		[]*CartItem  	`bun:"rel:has-many,join:id=book_id"`
	OrderItems 		[]*OrderItem 	`bun:"rel:has-many,join:id=book_id"`
}

type BookToCategory struct {
	bun.BaseModel `bun:"table:book_to_category"`

	BookID     	uuid.UUID 	`bun:"book_id,pk,type:uuid"`
	CategoryID 	uuid.UUID 	`bun:"category_id,pk,type:uuid"`

	Book 		*Book 		`bun:"rel:belongs-to,join:book_id=id"`
	Category 	*Category 	`bun:"rel:belongs-to,join:category_id=id"`
}

type Cart struct {
	bun.BaseModel `bun:"table:carts"`

	ID     	uuid.UUID 	`bun:"id,pk,type:uuid,default:gen_random_uuid()"`
	UserID 	uuid.UUID 	`bun:"user_id,type:uuid,notnull,unique"`

	User  	*User      	`bun:"rel:belongs-to,join:user_id=id"`
	Items 	[]*CartItem `bun:"rel:has-many,join:id=cart_id"`
}

type CartItem struct {
	bun.BaseModel `bun:"table:cart_items"`

	ID       	uuid.UUID 	`bun:"id,pk,type:uuid,default:gen_random_uuid()"`
	CartID   	uuid.UUID 	`bun:"cart_id,type:uuid,notnull"`
	BookID   	uuid.UUID 	`bun:"book_id,type:uuid,notnull"`
	Quantity 	int       	`bun:"quantity,notnull,default:1"`

	Cart 		*Cart 		`bun:"rel:belongs-to,join:cart_id=id"`
	Book 		*Book 		`bun:"rel:belongs-to,join:book_id=id"`
}

type Order struct {
	bun.BaseModel `bun:"table:orders"`

	ID         	uuid.UUID 		`bun:"id,pk,type:uuid,default:gen_random_uuid()"`
	UserID     	uuid.UUID 		`bun:"user_id,type:uuid,notnull"`
	TotalPrice 	float64   		`bun:"total_price,notnull,default:0"`
	Status     	string    		`bun:"status,notnull,default:'New'"`

	CreatedAt 	time.Time 		`bun:"created_at,nullzero,notnull,default:current_timestamp"`
	UpdatedAt 	time.Time 		`bun:"updated_at,nullzero,notnull,default:current_timestamp"`

	User      	*User        	`bun:"rel:belongs-to,join:user_id=id"`
	Items     	[]*OrderItem 	`bun:"rel:has-many,join:id=order_id"`
	Payment  	*Payment     	`bun:"rel:has-one,join:id=order_id"`
	Delivery  	*Delivery    	`bun:"rel:has-one,join:id=order_id"`
}

type OrderItem struct {
	bun.BaseModel `bun:"table:order_items"`

	ID       	uuid.UUID 	`bun:"id,pk,type:uuid,default:gen_random_uuid()"`
	OrderID  	uuid.UUID 	`bun:"order_id,type:uuid,notnull"`
	BookID   	uuid.UUID 	`bun:"book_id,type:uuid,notnull"`
	Quantity 	int       	`bun:"quantity,notnull,default:1"`

	Order 		*Order 		`bun:"rel:belongs-to,join:order_id=id"`
	Book  		*Book  		`bun:"rel:belongs-to,join:book_id=id"`
}

type Payment struct {
	bun.BaseModel `bun:"table:payments"`

	ID      	uuid.UUID 	`bun:"id,pk,type:uuid,default:gen_random_uuid()"`
	OrderID 	uuid.UUID 	`bun:"order_id,type:uuid,notnull,unique"`
	Amount  	float64   	`bun:"amount,notnull"`
	Method  	string    	`bun:"method,notnull"`
	Status  	string    	`bun:"status,notnull,default:'Not paid'"`

	CreatedAt 	time.Time 	`bun:"created_at,nullzero,notnull,default:current_timestamp"`
	UpdatedAt 	time.Time 	`bun:"updated_at,nullzero,notnull,default:current_timestamp"`

	Order 		*Order 		`bun:"rel:belongs-to,join:order_id=id"`
}

type Delivery struct {
	bun.BaseModel `bun:"table:deliveries"`

	OrderID 	uuid.UUID 	`bun:"order_id,pk,type:uuid"`
	Address 	string    	`bun:"address,notnull"`
	Status  	string    	`bun:"status,notnull,default:'Waiting'"`

	CreatedAt 	time.Time 	`bun:"created_at,nullzero,notnull,default:current_timestamp"`
	UpdatedAt 	time.Time 	`bun:"updated_at,nullzero,notnull,default:current_timestamp"`

	Order 		*Order 		`bun:"rel:belongs-to,join:order_id=id"`
}

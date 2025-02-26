class Product {
    constructor(id, name, category, description, price, stockCount, brand, imageUrl, isAvailable) {
        if(!id || !name || !category || !description || !price || !stockCount || !brand || !imageUrl || !isAvailable) {
            throw new Error('All fields are required');
        }
        this.id = id;
        this.name = name;
        this.category = category;
        this.description = description;
        this.price = price;
        this.stockCount = stockCount;
        this.brand = brand;
        this.imageUrl = imageUrl;
        this.isAvailable = isAvailable;
        this.createdAt = new Date().toISOString();
    }
}

module.exports = Product;
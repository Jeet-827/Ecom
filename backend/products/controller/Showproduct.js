import Product from "../model/productSchema.js";

export const getProducts = async (req, res) => {
  try {
    let count = await Product.countDocuments();
    const firstProduct = await Product.findOne();

    // Check if any product contains the broken Unsplash URLs to trigger a reseed
    const hasBrokenImage = await Product.findOne({
      productimage: {
        $in: [
          /1622445262465/,
          /1580870013141/,
          /1609592424109/
        ]
      }
    });

    const needsReseed = firstProduct && (!firstProduct.productimage.startsWith("http") || hasBrokenImage);

    if (count === 0 || needsReseed) {
      console.log("Reseeding products database with high-resolution image URLs...");
      await Product.deleteMany({});
      const defaultProducts = [
        {
          productname: "Premium Wireless Headphones",
          productdec: "Experience premium audio quality with active noise cancellation and long battery life.",
          price: 199,
          category: "Audio",
          stock: 25,
          productimage: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&auto=format&fit=crop&q=60",
          brand: "Acoustics",
          isFeatured: true,
        },
        {
          productname: "Smartwatch Pro",
          productdec: "Track your fitness, heart rate, and notifications with this sleek and durable smartwatch.",
          price: 249,
          category: "Wearables",
          stock: 15,
          productimage: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&auto=format&fit=crop&q=60",
          brand: "WearFit",
          isFeatured: true,
        },
        {
          productname: "Portable Speaker",
          productdec: "Take your music anywhere with this dustproof and waterproof Bluetooth speaker.",
          price: 89,
          category: "Audio",
          stock: 40,
          productimage: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=500&auto=format&fit=crop&q=60",
          brand: "SoundBlast",
          isFeatured: true,
        },
        {
          productname: "USB-C Power Bank",
          productdec: "High-capacity 20000mAh power bank with ultra-fast charging capability.",
          price: 49,
          category: "Accessories",
          stock: 50,
          productimage: "https://images.unsplash.com/photo-1609081219090-a6d81d3085bf?w=500&auto=format&fit=crop&q=60",
          brand: "PowerUp",
          isFeatured: false,
        },
        {
          productname: "Digital Camera",
          productdec: "Capture stunning moments with high-resolution sensors and built-in optical zoom.",
          price: 449,
          category: "Cameras",
          stock: 10,
          productimage: "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=500&auto=format&fit=crop&q=60",
          brand: "LensPro",
          isFeatured: true,
        },
        {
          productname: "Wireless Charger",
          productdec: "Fast wireless charging pad compatible with all Qi-enabled devices.",
          price: 35,
          category: "Accessories",
          stock: 100,
          productimage: "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=500&auto=format&fit=crop&q=60",
          brand: "ChargeSync",
          isFeatured: false,
        },
        {
          productname: "Phone Case Pro",
          productdec: "Military-grade drop-tested phone case with clean matte finish.",
          price: 25,
          category: "Accessories",
          stock: 80,
          productimage: "https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=500&auto=format&fit=crop&q=60",
          brand: "ShieldX",
          isFeatured: false,
        },
        {
          productname: "Screen Protector Set",
          productdec: "Ultra-thin tempered glass screen protectors for crystal clear protection.",
          price: 15,
          category: "Accessories",
          stock: 120,
          productimage: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500&auto=format&fit=crop&q=60",
          brand: "ShieldX",
          isFeatured: false,
        },
      ];
      await Product.insertMany(defaultProducts);
      console.log("Seeding complete!");
    }

    const { sort, search, category } = req.query;
    const query = {};

    if (search) {
      // Case-insensitive regex search on productname
      query.productname = { $regex: search, $options: "i" };
    }

    if (category && category !== "All") {
      query.category = category;
    }

    let queryBuilder = Product.find(query);

    // Dynamic sorting
    if (sort) {
      if (sort === "Price: Low to High") {
        queryBuilder = queryBuilder.sort({ price: 1 });
      } else if (sort === "Price: High to Low") {
        queryBuilder = queryBuilder.sort({ price: -1 });
      } else if (sort === "Newest First") {
        queryBuilder = queryBuilder.sort({ createdAt: -1 });
      } else if (sort === "Most Popular") {
        queryBuilder = queryBuilder.sort({ isFeatured: -1, createdAt: -1 });
      } else {
        queryBuilder = queryBuilder.sort({ createdAt: -1 });
      }
    } else {
      queryBuilder = queryBuilder.sort({ createdAt: -1 });
    }

    const products = await queryBuilder;
    res.status(200).json(products);
  } catch (error) {
    console.error("Error in getProducts:", error.message);
    res.status(500).json({ message: "Server error occurred while fetching products" });
  }
};

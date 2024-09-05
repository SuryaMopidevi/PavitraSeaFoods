const express = require("express");
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const session = require('express-session');
const cors = require('cors');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const faq = require('./models/faq.js')
const customer = require('./models/customer.js')
const PersonalDetails =require('./models/Personaldetails.js')
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const productModel =require('./models/productModel.js');
const userWishlist =require('./models/wishlist.js');
const Cart = require('./models/cart.js');
const Order=require("./models/orders.js");
const Address = require('./models/address.js');
const reviews = require('./models/reviews.js');
const Query = require('./models/query.js');


const app = express();
dotenv.config()
const port = process.env.port
const url = process.env.url
const email = process.env.email
const pass = process.env.password
const jwtSecret = process.env.jwtSecret
const token = process.env.token || '1m'
const session_Secret_key =process.env.SESSION_SECRET
app.use(cors({
  origin: 'http://localhost:3007', // Frontend URL
  credentials: true, // Enable cookies and sessions
}));

app.use(bodyParser.json());

app.use((req, res, next) => {
  console.log(req.url);
  next();
});

// Setup sessions
app.use(session({
  secret: session_Secret_key, // Use the secret from environment variable
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false } // Set to true if using HTTPS
}));

// Logout route
app.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Error destroying session:', err);
      return res.status(500).send({ message: 'Logout failed' });
    }
    res.clearCookie('connect.sid'); // Clear the session cookie
    return res.status(200).send({ message: 'Logged out successfully' });
  });
});

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: email,
      pass: pass
    }
  });
  
  app.get('/CheckEmail', async (req, res) => {
    const { email } = req.query;
    try {
        let data = await PersonalDetails.find({ email: email });
        res.send(data);
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});

  // Email Verification
  app.post('/sendEmail', async (req, res) => {
    const { gmail ,verificationCode} = req.body;
  
    const mailOptions = {
      from: email,
      to: gmail,
      subject: 'Verification Code',
      html: `<p>Your OTP to verify Email in Neighborgood is :<h2>${verificationCode}<h2> </p>`
    };
  
    try {
      await transporter.sendMail(mailOptions);
      res.status(200).json({ message: 'Email sent successfully' });
    } catch (error) {
      console.error('Error sending email:', error);
      res.status(500).json({ message: 'Failed to send email' });
    }
  });


//forgot password update
app.put('/passwordReset', async (req, res) => {
  const { token, newPassword } = req.body;
  console.log(req.body)

  try {
    // Verify token
    const decoded = jwt.verify(token, jwtSecret);

    // Find user by email and ensure token is valid and not expired
    const user = await PersonalDetails.findOne({
      email: decoded.email
      
      // resetPasswordToken: token,
      // resetPasswordExpires: { $gt: Date.now() }
    });
    console.log(decoded.email)

    if (!user) {
      return res.status(400).send({ message: 'Invalid or expired token' });
    }

    // Update the user's password
    user.password = await bcrypt.hash(newPassword, 10);
    // user.resetPasswordToken = undefined; // Clear the reset token
    // user.resetPasswordExpires = undefined; // Clear the expiration
    await user.save();

    res.status(200).send({ message: 'Password has been reset' });
  } catch (error) {
    res.status(500).send({ message: 'Server error', error: error.message });
    console.log(error)
  }
});

//forgot password email link 
app.post('/sendUrl', async (req, res) => {
  const { email } = req.body;

  try {
    const user = await PersonalDetails.findOne({ email: email });
    if (!user) {
      return res.status(400).send({ message: 'User not found' });
    }

    // Generate reset token
    const resetToken = jwt.sign({ email: user.email }, jwtSecret, { expiresIn: token });

    // Save token and expiration date to the user's record
    // user.resetPasswordToken = resetToken;
    // user.resetPasswordExpires = Date.now() + 600; // 10 minutes from now
    // await user.save();

    // Send email with the reset link
    const resetUrl = `http://localhost:3007/passwordReset?token=${resetToken}`; // Update with your frontend reset URL

    const mailOptions = {
      from: email,
      to: email,
      subject: 'Reset Your Password',
      html: `<p>Click the following link to reset your password:</p>
             <a href="${resetUrl}">${resetUrl}</a>`
    };

    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: 'Password reset email sent' });
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({ message: 'Failed to send email' });
  }
});

//contact us

app.post('/sendQuery', async (req, res) => {
  // console.log(req.body)
  await Query.create(req.body)
      .then((e) => {
          res.send(true)
      })
      .catch((e) => {
          res.send(false)
      })
})
app.get('/getQuery', async (req, res) => {
  try {
      let data = await Query.find({ answer : '' });
      res.send(data);
  } catch (error) {
      console.error(error);
      res.status(500).send('Internal Server Error');
  }
});
// app.post('/sendMessage', async (req, res) => {
//   const {id,gmail,name,subject,query,answer } = req.body;
//   console.log(req.body)
//   const mailOptions = {
//     from: email,
//     to: gmail,
//     subject: subject,
//     html: `<p> Details <h4>${name}  </h4>: ${query} ${answer}</p>`
//   };

//   try {
//     await Query.findByIdAndUpdate(
//       id,
//       { answer: answer }
//       // { new: true } // Return the updated document
//     );
//     await transporter.sendMail(mailOptions);
//     res.status(200).json({ message: 'Email sent successfully' });
//   } catch (error) {
//     console.error('Error sending email:', error);
//     res.status(500).json({ message: 'Failed to send email' });
//   }

// });
app.post('/sendMessage', async (req, res) => {
  const { id, gmail, name, subject, query, answer } = req.body;
  console.log(req.body)
  
  const mailOptions = {
    from: email,
    to: gmail,
    subject: subject,
    html: `<p> Details <h4>${name}  </h4>: ${query} ${answer}</p>`
  };

  try {
    await Query.findByIdAndUpdate(
      id,
      { answer: answer },
      { new: true } // Return the updated document
    );
    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: 'Email sent successfully' });
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({ message: 'Failed to send email' });
  }
});


  
//FAQ

// Post a new FAQ
app.post('/PostQuestion', async (req, res) => {
  try {
    const { productId, question, username } = req.body;
    const newFaq = new faq({ productId, question, username });
    await newFaq.save();
    res.status(201).json(newFaq);
  } catch (error) {
    res.status(500).json({ message: 'Error submitting FAQ', error });
  }
});



// Get FAQs for a specific product
app.get('/getQuestion', async (req, res) => {
  try {
    // Fetch FAQs without answers
    const faqs = await faq.find({ answer: '' }).populate('productId');

    // Check if FAQs were found
    if (!faqs.length) {
      return res.status(404).json({ message: 'No unanswered FAQs found.' });
    }

    // If FAQs are found, include related product details
    const faqWithProductDetails = faqs.map((faq) => ({
      question: faq.question,
      faqId: faq._id,
      product: {
        productname: faq.productId.productname,
        img1: faq.productId.img1,
        price: faq.productId.price,
        size: faq.productId.size
        // Add any other relevant product fields here
      },
      answer: faq.answer,
    }));

    res.status(200).json(faqWithProductDetails);
    console.log(faqWithProductDetails)
  } catch (error) {
    console.error('Error fetching FAQs and product details:', error);
    res.status(500).json({ message: 'Error fetching FAQs and product details', error });
  }
});

app.post('/answerQuestion/:faqId', async (req, res) => {
  const { faqId } = req.params;
  const { answer } = req.body;

  try {
    // Find the FAQ by its ID and update its answer field
    const updatedFAQ = await faq.findByIdAndUpdate(
      faqId,
      { answer: answer },
      { new: true } // Return the updated document
    );

    if (updatedFAQ) {
      res.status(200).json({ message: 'Answer submitted successfully', updatedFAQ });
    } else {
      res.status(404).json({ message: 'FAQ not found' });
    }
  } catch (error) {
    console.error('Error submitting answer:', error);
    res.status(500).json({ message: 'Error submitting answer', error });
  }
});

// Get answered FAQs for a specific product
app.get('/getAnsweredFAQs/:productId', async (req, res) => {
  const { productId } = req.params;
  console.log("Product ID:", productId); // Log the product ID

  try {
    const faqs = await faq.find({ productId: productId, answer: { $ne: '' } }).populate('productId');
    console.log("FAQs Fetched:", faqs); // Log the fetched FAQs

    if (faqs.length === 0) {
      res.status(200).json({ message: 'No answered FAQs for this product.' });
    } else {
      res.status(200).json(faqs);
    }
  } catch (error) {
    console.error('Error fetching answered FAQs:', error);
    res.status(500).json({ message: 'Error fetching answered FAQs', error });
  }
});




//customer rating

app.post('/reviews', async (req, res) => {
  try {
    const { productId, review, username } = req.body;
    const newReview = new reviews({ productId, review, username });
    await newReview.save();
    res.status(201).json(newReview);
  } catch (error) {
    res.status(500).json({ message: 'Error submitting FAQ', error });
  }
});

app.get('/reviews/:id', async (req, res) => {
  try {
    const productId = req.params.id;
    const reviews = await reviews.find({ productId });

    if (!reviews) {
      return res.status(404).json({ message: 'No reviews found for this product.' });
    }

    res.json(reviews);
  } catch (error) {
    console.error('Error fetching reviews:', error);
    res.status(500).json({ message: 'Server error while fetching reviews.' });
  }
});

//customer feedback
app.post('/customerFeedback', async (req, res) => {
  // console.log(req.body)
  await customer.create(req.body)
      .then((e) => {
          res.send(true)
      })
      .catch((e) => {
          res.send(false)
      })
})

// personal details 

app.post('/', async(req, res) => {

  const { email,username,password,address, state, pincode, gender, phonenumber, profileUrl } = req.body;
  // console.log(req.body)

  if (!email || !username || !password || !address || !state || !pincode || !gender || !phonenumber || !profileUrl) {
      return res.status(400).send({ message: "All fields are required" });
  }
  let users = [];

  // Simulate saving to database
  const newUser = {
      email,
      username,
      password,
      address,
      state,
      pincode,
      gender,
      phonenumber,
      profileUrl
  };

  users.push(newUser);
  await PersonalDetails.create(users)
      .then((e) => {
          res.send(true)
      })
      .catch((e) => {
          console.log(e)
          res.send(false)
      })
});
app.get('/viewProfile', async (req, res) => {
  const { email } = req.query;
  try {
    const userProfile = await PersonalDetails.findOne({ email: email });
    if (!userProfile) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(userProfile);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/updateProfile', async (req, res) => {
  const { email, username, password, phoneNumber, address, state, gender, pincode, profileUrl } = req.body;
  try {
    const user = await PersonalDetails.findOneAndUpdate(
      { email: email }, // Find the document with this email
      { username, password, phoneNumber, address, state, gender, pincode, profileUrl }, // Update these fields
      { new: true } // Return the updated document
    );
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});



app.get('/products', async (req, res) => {
  try {
    const products = await productModel.find();
    res.json(products);
  } catch (err) {
    console.log(err)
    res.status(500).json({ error: err.message });
  }
});

//product details
// Updated endpoint to use route parameters
app.get('/productDetails/:id', async (req, res) => {
  const { id } = req.params; // Extracting id from route params
  try {
    const product = await productModel.findById(id); // Use findById for better clarity and single document retrieval
    if (product) {
      res.json(product);
    } else {
      res.status(404).json({ error: 'Product not found' });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/productDetails', async (req, res) => {
  const { productname, size } = req.query;
  try {
    const product = await productModel.findOne({ productname, size });
    if (!product) {
      return res.status(404).send('Product not found');
    }
    res.send(product);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

//wishlist

// Get user's wishlist
app.get('/wishlist', async (req, res) => {
  const { email } = req.query;
  try {
    const user = await userWishlist.findOne({ email }).populate('wishlist');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({ wishlist: user.wishlist });
  } catch (error) {
    console.error('Error fetching wishlist:', error);
    res.status(500).json({ error: 'Failed to fetch wishlist' });
  }
});


app.post('/updateWishlist', async (req, res) => {
  const { email, wishlist } = req.body;
  try {
    const user = await userWishlist.findOneAndUpdate(
      { email },
      { wishlist: wishlist.map(item => item._id) },
      { new: true, upsert: true }
    ).populate('wishlist');
    res.json({ wishlist: user.wishlist });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update wishlist' });
  }
});

// Add a product to cart (simplified version)
app.post('/addToCart', async (req, res) => {
  const { email, productId } = req.body;

  try {
    let cart = await Cart.findOne({ email });

    if (!cart) {
      cart = new Cart({ email, items: [] });
    }

    const index = cart.items.findIndex(item => item.product.equals(productId));

    if (index !== -1) {
      return res.status(400).json({ message: 'Product already in cart' });
    } else {
      cart.items.push({ product: productId });
      await cart.save();
      return res.status(201).json({ message: 'Product added to cart' });
    }
  } catch (error) {
    console.error('Error adding to cart:', error);
    return res.status(500).json({ message: 'Failed to add product to cart' });
  }
});


// Route to get cart items
app.get('/cartItems', async (req, res) => {
  const { email } = req.query;

  try {
    const cart = await Cart.findOne({ email }).populate('items.product');
    res.status(200).json({ items: cart ? cart.items : [] });
  } catch (error) {
    res.status(500).json({ error: 'Error fetching cart items' });
  }
});

// Route to delete a cart item
app.delete('/deleteCart', async (req, res) => {
  const { email, productId } = req.query;

  try {
    const cart = await Cart.findOne({ email });
    if (cart) {
      cart.items = cart.items.filter(item => item.product._id.toString() !== productId);
      await cart.save();
    }
    const updatedCart = await Cart.findOne({ email }).populate('items.product');
    res.status(200).json({ items: updatedCart ? updatedCart.items : [] });
  } catch (error) {
    res.status(500).json({ error: 'Error removing from cart' });
  }
});

// Route to update the quantity of a cart item
app.put('/updateCart', async (req, res) => {
  const { email, productId, quantity } = req.body;

  try {
    const cart = await Cart.findOne({ email });
    if (cart) {
      const item = cart.items.find(item => item.product._id.toString() === productId);
      if (item) {
        item.quantity = quantity;
        await cart.save();
      }
    }
    const updatedCart = await Cart.findOne({ email }).populate('items.product');
    res.status(200).json({ items: updatedCart ? updatedCart.items : [] });
  } catch (error) {
    res.status(500).json({ error: 'Error updating cart' });
  }
});
app.get('/getOrders', async (req, res) => {
  const { email } = req.query;
  try {
    const orders = await Order.find({ userEmail: email });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create a new order
app.post('/createOrder', async (req, res) => {
  const { userEmail, items, total } = req.body;
  try {
    const order = new Order({
      userEmail,
      items,
      total,
    });
    await order.save();
    res.status(201).json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

//default address
app.get('/getAddress', async (req, res) => {
  const { email } = req.query;
  // console.log(email)
  try {
    const address = await PersonalDetails.find({ email: email });
    // console.log(address)
    res.json(address);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// add address
app.post('/address', async (req, res) => {
  const { email, username, address, state,city, pincode, phonenumber } = req.body;
  try {
    const updatedAddress = await PersonalDetails.find(
      { email },
      { username, address, state,city, pincode, phonenumber },
      { new: true, upsert: true }
    );
    res.json(updatedAddress);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


mongoose.connect(url)
  
    .then((e) => {
        console.log('mongoose connected succesfully........')
    })
    .catch((e) => {
      // console.log(url);
      console.log(e)
        console.log("Connection FAILED")
    })

app.listen(port, () => {
    console.log(`server listening on ${port}`)
})



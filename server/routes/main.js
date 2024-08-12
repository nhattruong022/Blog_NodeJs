const express = require('express');
const router = express.Router();
const post = require('../models/Post');
const Comment = require('../models/comment'); // Đảm bảo rằng bạn đã khai báo đúng model Comment
const nodeMailer = require('nodemailer');
const MailMessage = require('nodemailer/lib/mailer/mail-message');
require('dotenv').config();
const mongoose = require('mongoose');

// const EventEmitter = require('events');
// const emitter = new EventEmitter();
// // Tăng giới hạn listener lên 20
// emitter.setMaxListeners(20);


//ROUTES

router.get('', async (req, res) => {
  try {
    const locals = {
      title: "NodeJS Blog",
      description: "Simple Blog created with NodeJS, Express & MongoDb",
    }


    let perpage = 10; //đặt số bài viết mỗi trang là 10.
    let page = req.query.page || 1; //lấy số trang hiện tại từ các tham số truy vấn (req.query.page). Nếu không được cung cấp, nó mặc định là 1.

    const data = await post.aggregate([{ $sort: { createdAt: -1 } }]) //sắp xếp các bài viết theo createdAt theo thứ tự giảm dần (mới nhất trước).
      .skip(perpage * (page - 1))//bỏ qua các tài liệu cho các trang trước đó.
      .limit(perpage) //giới hạn kết quả với số bài viết mỗi trang.
      .exec(); //thực thi chuỗi tổng hợp.


    const count = await post.countDocuments(); //số lượng bài viết trong database
    const nextPage = parseInt(page) + 1;  //tính toán số trang tiếp theo.
    const hasNextPage = nextPage <= Math.ceil(count / perpage); //xác định xem có trang tiếp theo không

    res.render('index', {
      locals,
      data,
      current: page, //số trang hiện tại (current)
      nextPage: hasNextPage ? nextPage : null //số trang tiếp theo (nextPage nếu tồn tại, nếu không là null
    });
  } catch (error) {
    console.log(error);
  }
});


/**
 * GET
 * Search post
 */

router.post('/search', async (req, res) => {
  try {
    const locals = {
      title: "Search",
      description: "Simple Blog created with NodeJS, Express & MongoDb"
    }

    let searchTerm = req.body.searchTerm; //lấy giá trị từ form tìm kiếm mà người dùng đã nhập.
    const searchNoSpecialChar = searchTerm.replace(/[^a-zA-Z0-9]/g, "");//// loại bỏ tất cả các ký tự đặc biệt từ chuỗi tìm kiếm.

    const data = await post.find({
      $or: [ //$or là một toán tử của MongoDB, nó cho phép thực hiện tìm kiếm với điều kiện OR (hoặc).
        //'i' là flag cho phép tìm kiếm không phân biệt chữ hoa chữ thường (case-insensitive).
        { title: { $regex: new RegExp(searchNoSpecialChar, 'i') } },//sử dụng biểu thức chính quy để tìm kiếm.
        { body: { $regex: new RegExp(searchNoSpecialChar, 'i') } }
      ]
    });

    res.render("search", {
      locals,
      data
    });
  }
  catch (error) {
    console.log(error);
  }
})
/**
 * 
const searchNoSpecialChar = searchTerm.replace(/[^a-zA-Z0-9]/g, "");:
searchTerm.replace(/[^a-zA-Z0-9]/g, "") loại bỏ tất cả các ký tự đặc biệt từ chuỗi tìm kiếm.
Biểu thức chính quy /[^a-zA-Z0-9]/g:
[^a-zA-Z0-9]: tìm kiếm bất kỳ ký tự nào không phải là chữ cái hoặc số.
g: global, có nghĩa là áp dụng biểu thức cho toàn bộ chuỗi.
Kết quả là một chuỗi chỉ chứa các chữ cái và số, được lưu trữ trong biến searchNoSpecialChar.



$or: [...]:
$or là một toán tử của MongoDB, nó cho phép thực hiện tìm kiếm với điều kiện OR (hoặc).
Các điều kiện bên trong mảng [ ... ] sẽ được kiểm tra và nếu bất kỳ điều kiện nào đúng,
tài liệu sẽ được chọn.
{ title: { $regex: new RegExp(searchNoSpecialChar, 'i') } } và 
 { body: { $regex: new RegExp(searchNoSpecialChar, 'i') } }:

{ $regex: new RegExp(searchNoSpecialChar, 'i') } sử dụng biểu thức chính quy để tìm kiếm.
new RegExp(searchNoSpecialChar, 'i'):
searchNoSpecialChar là chuỗi tìm kiếm đã loại bỏ ký tự đặc biệt.
'i' là flag cho phép tìm kiếm không phân biệt chữ hoa chữ thường (case-insensitive).
 */


/**
 * GET
 * Detail post
 */
router.get('/detail/:id', async (req, res) => {
  try {
    const locals = {
      title: "NodeJS Blog ",
      description: "Simple Blog created with NodeJS, Express & MongoDb",
    };

    const data = await post.findOne({ _id: req.params.id });
    if (!data) {
      return res.status(404).send('Post not found');
    }
    const comments = await Comment.find({ postId: req.params.id });

    //views
    data.views+=1;
    await data.save();

   
    res.render('detail', {
      data,
      comments,
      locals
    });
  } catch (error) {
    console.error(error);
    res.status(500).send('Server Error');
  }
});




// Route để cập nhật lượt xem
router.post('/update-view-count/:id',async(req,res)=>{
  const postId=req.params.id;
  
  try{
    const post=await post.findById(postId);
    if(post){
      post.views+=1;
      await post.save();
      res.json({success:true,views:post.views});
    }
    else{
      res.status(404).json({success:false,message:'Post not found'});
    }
  }
  catch(error){
    console.log(error);
  }
})

//Số lượng comment
//comment post 
router.post('/detail/:id/comment', async (req, res) => {
  try {
    const postId = req.params.id;
    const { content } = req.body;

    if (!content || content.trim() === '') {
      return res.status(400).send('Content is required');
    }

    const newComment = new Comment({
      postId: postId,
      content: content
    });

    await newComment.save();

    // Tăng số lượng bình luận của bài viết
    await post.findByIdAndUpdate(postId, { $inc: { commentCount: 1 } });

    res.redirect(`/detail/${postId}`);
  } catch (error) {
    console.error(error);
    res.status(500).send('Server Error');
  }
});


//delete comment
router.delete('/delete-comment/:id',async(req,res)=>{
  try{
  
    await Comment.deleteOne({_id:req.params.id});
    res.redirect('/');
  }
  catch(error){
    console.error("Error deleting comment:", error);
    res.status(500).json({ success: false, message: 'An error occurred while deleting the comment' });
  }
})



//function cập nhập lượt xem bài viết

// router.patch('/detail/:id', async (req, res) => {
//   try {
//     const Post = await post.findById(req.params.id);

//     if (!Post) {
//       return res.status(404).json({ error: 'Post not found' });
//     }
//     Post.views += 1;
//     await Post.save();

//     res.json({ views: Post.views });
//   } catch (error) {
//     res.status(500).json({ error: 'Server error' });
//   }
// });

// router.get('', async (req, res) => {
//   const locals = {
//     title: "NodeJS Blog",
//     description: "Simple Blog created with NodeJS, Express & MongoDb"
//   }

//   try {
//     const data = await post.find();
//     res.render('index', { locals,data });
//   }catch (error) {
//     console.log(error);
//   }
// });




router.get('/about', async (req, res) => {
  res.render('about');
});


// GET request cho contact form
router.get('/contact', (req, res) => {
  try {
    const locals = {
      title: 'Contact Us',
      description: 'Simple Blog created with NodeJS, Express & MongoDB'
    };
    res.render('contact', { locals });
  } catch (error) {
    console.log(error);
    res.status(500).send('Server error');
  }
});

// POST request để gửi contact form message
router.post('/contact', async (req, res) => {
  const { name, email, message } = req.body;

  let transporter = nodeMailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.Email_USER,  // Đảm bảo biến môi trường đúng
      pass: process.env.Email_PASS
    }
  });

  let mailOptions = {
    from: process.env.Email_USER,
    to: 'nhattruongp78@gmail.com',
    subject: 'Contact From Message',
    text: `Tên: ${name}\nEmail: ${email}\nTin nhắn: ${message}` //txt hiển thị
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Tin nhắn đã gửi');
    res.redirect('/');  // Chuyển hướng đến trang chủ hoặc trang cảm ơn
  } catch (error) {
    console.log(error);
    res.status(500).send('Failed to send message');
  }
});


//Thả tym
router.patch('/post/:id/like', async (req, res) => {
  try {
    const postId = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(postId)) {
      return res.status(400).json({ message: 'Invalid Post ID' });
    }

    const postToUpdate = await post.findById(postId);
    if (!postToUpdate) {
      return res.status(404).json({ message: 'Post not found' });
    }

    postToUpdate.likes += 1;
    await postToUpdate.save(); // Save the updated post

    res.json({ likes: postToUpdate.likes }); // Return the new like count
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});











// function insertPostData() {
//   Post.insertMany([
//     {
//       title: "Building APIs with Node.js",
//       body: "Learn how to use Node.js to build RESTful APIs using frameworks like Express.js"
//     },
//     {
//       title: "Deployment of Node.js applications",
//       body: "Understand the different ways to deploy your Node.js applications, including on-premises, cloud, and container environments..."
//     },
//     {
//       title: "Authentication and Authorization in Node.js",
//       body: "Learn how to add authentication and authorization to your Node.js web applications using Passport.js or other authentication libraries."
//     },
//     {
//       title: "Understand how to work with MongoDB and Mongoose",
//       body: "Understand how to work with MongoDB and Mongoose, an Object Data Modeling (ODM) library, in Node.js applications."
//     },
//     {
//       title: "build real-time, event-driven applications in Node.js",
//       body: "Socket.io: Learn how to use Socket.io to build real-time, event-driven applications in Node.js."
//     },
//     {
//       title: "Discover how to use Express.js",
//       body: "Discover how to use Express.js, a popular Node.js web framework, to build web applications."
//     },
//     {
//       title: "Asynchronous Programming with Node.js",
//       body: "Asynchronous Programming with Node.js: Explore the asynchronous nature of Node.js and how it allows for non-blocking I/O operations."
//     },
//     {
//       title: "Learn the basics of Node.js and its architecture",
//       body: "Learn the basics of Node.js and its architecture, how it works, and why it is popular among developers."
//     },
//     {
//       title: "NodeJs Limiting Network Traffic",
//       body: "Learn how to limit netowrk traffic."
//     },
//     {
//       title: "Learn Morgan - HTTP Request logger for NodeJs",
//       body: "Learn Morgan."
//     },
//   ])
// }

// insertPostData();

module.exports = router;



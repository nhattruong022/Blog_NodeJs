const express = require('express');
const bcrypt = require('bcrypt');
const router = express.Router();
const userSchema = require('../models/users');
const post = require('../models/Post');
// const jwt=require('jsonwebtoken');
const adminLayout = '../views/layouts/admin';
const bodyparser = require('body-parser');
const { errorMonitor } = require('connect-mongo');

// const jwtSecret=process.env.jwtSecret;

router.use(bodyparser.urlencoded({ extended: true }));


/**
 * GET /
 * Admin - Login Page
*/router.get('/admin', async (req, res) => {
  try {
    const locals = {
      title: "Admin",
      description: "Simple Blog created with NodeJs, Express & MongoDb."
    };
    res.render('admin/index', { locals, layout: adminLayout, errorMessage: null });
  } catch (error) {
    console.log(error);
    res.status(500).send("Lỗi Máy Chủ Nội Bộ");
  }
});

/**
 * POST /
 * Admin - Login Page
 */
router.post('/admin', async (req, res) => {
  try {
    const data = {
      username: req.body.username,
      password: req.body.password
    };

    if (!data.username || !data.password) {
      return res.render('admin/index', {
        locals: {
          title: "Admin",
          description: "Simple Blog created with NodeJs, Express & MongoDb."
        },
        layout: adminLayout,
        errorMessage: "Vui lòng điền đầy đủ thông tin."
      });
    }

     const check = await userSchema.findOne({ username: data.username });

    if (!check) {
      return res.render("admin", { errorMessage: "Tài khoản không tồn tại" });
    }

    const isPasswordMatch = await bcrypt.compare(data.password, check.password);

    if (isPasswordMatch) {
      return res.redirect('/dashboard');
    }
    else {
      return res.render('admin/index', {
        locals: {
          title: "Admin",
          description: "Simple Blog created with NodeJs, Express & MongoDb."
        },
        layout: adminLayout,
        errorMessage: "Mật khẩu không đúng"
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).send("Lỗi Máy Chủ Nội Bộ");
  }
});

// Hiển thị form đăng ký


//chuyen huong sang register
router.get('/register', async (req, res) => {
  try {
    const locals = {
      title: "Admin",
      description: "Simple Blog created with NodeJs, Express & MongoDb."
    }
    res.render('admin/register',
      {
        locals,
        layout: adminLayout,
        errorMessage: null
      });


    router.post('/register', async (req, res) => {
      const data = {
        email: req.body.email,
        username: req.body.username,
        password: req.body.password
      };

      if (!data.email || !data.username || !data.password) {
        return res.render('admin/register', {
          locals: {
            title: "Admin",
            description: "Simple Blog created with NodeJs, Express & MongoDb."
          },
          layout: adminLayout,
          errorMessage: "Vui lòng điền đầy đủ thông tin."
        });
      }

      const existUser = await userSchema.findOne({ username: data.username });
      if (existUser) {
        return res.render('admin/register', {
          locals: {
            title: "Admin",
            description: "Simple Blog created with NodeJs, Express & MongoDb."
          },
          layout: adminLayout,
          errorMessage: "Username này đã tồn tại, vui lòng chọn username khác."
        });
      }
      else {
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(data.password, saltRounds);
        data.password = hashedPassword;
        const userdata = await userSchema.insertMany(data);
        console.log(userdata);
        res.redirect('/admin');
      }
    })
  }
  catch (error) {
    console.log(error);
    res.status(500).render("register", { errorMessage: "Đã xảy ra lỗi khi đăng ký. Vui lòng thử lại." });
  }
});

//Router
//Dashboard

router.get('/dashboard', async (req, res) => {
  try {
    const locals = {
      title: 'Dashboard',
      description: 'Simple Blog created with NodeJS, Express & MongoDB'
    }
    const data = await post.find();
    res.render('admin/dashboard', { data });
  }
  catch (error) {
    console.log(error);
    res.status(500).render("register", { errorMessage: "Đã xảy ra lỗi khi đăng ký. Vui lòng thử lại." });
  }
});


/**
 * GET
 * Admin -Create New Post
 */
router.get('/add-post', async (req, res) => {
  try {
    const locals = {
      title: 'Dashboard',
      description: 'Simple Blog created with NodeJS, Express & MongoDB'
    }
    res.render('admin/add-post',
      {
        locals,
        layout: adminLayout
      });

    router.post('/add-post', async (req, res) => {
      const data = {
        title: req.body.title,
        body: req.body.body
      }

      const postdata = await post.insertMany(data);
      console.log(postdata);
      res.redirect('dashboard');
    });
  }
  catch (error) {
    console.log(error);
  }
});


/**
 * GET
 * Admin -Update Post
 */
router.get('/edit-post/:id', async (req, res) => {
  try {
    const locals = {
      title: 'Dashboard',
      description: 'Simple Blog created with NodeJS, Express & MongoDB'
    }

    const data = await post.findOne({ _id: req.params.id });
    res.render('admin/edit-post',
      {
        locals,
        data,
        layout: adminLayout
      });
  }
  catch (error) {
    console.log(error);
  }
});


/**
 * Put
 * EDIT
 */
router.put('/edit-post/:id',async(req,res)=>{
  try{
    await post.findByIdAndUpdate(req.params.id,{
      title:req.body.title,
      body:req.body.body,
      updatedAt:Date.now()
    });

    res.redirect(`/edit-post/${req.params.id}`); 
  }
  catch(error){
    console.log(error);
    res.status(500).send("An error occurred while fetching the post.");
  }
});

/**
 * DELETE
 */
router.delete('/delete-post/:id',async(req,res)=>{
try{
  await post.deleteOne({_id:req.params.id});
  res.redirect('/dashboard');
}
catch(error){
console.log(error);
}
});


/**
 * GET
 * Logout
 */
router.get('/logout',async(req,res)=>{
  res.redirect('/');
});

module.exports = router;

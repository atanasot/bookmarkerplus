const Sequelize = require("sequelize");
const sequelize = new Sequelize(
  process.env.DATABASE_URL || "postgres://localhost/bookmarker_plus_db"
);
const express = require("express");
const app = express();
//app.use(express.urlencoded({extended: false})) //this we need for the post method to display the input

//app.use(methodOverride('_method'))  -- use this when we try to say method=delete in the form

const Bookmark = sequelize.define("bookmark", {
  name: {
    type: Sequelize.STRING,
    allowNull: false,
    unique: true,
  },
});

const Category = sequelize.define("category", {
  name: {
    type: Sequelize.STRING,
    allowNull: false,
    unique: true,
  },
});

Bookmark.belongsTo(Category);
Category.hasMany(Bookmark);

//express app

app.get("/", (req, res) => res.redirect("/bookmarks"));

// app.post('/bookmarks' , async(req, res, next) => {
//   try {
//     const bookmark = await Bookmark.create(req.body)
//     res.redirect
//   }

// })

app.get("/bookmarks", async (req, res, next) => {
  try {
    const bookmarks = await Bookmark.findAll({
      include: [Category],
    });
    //const categories = await Category.findAll();
    res.send(
      `<html>
        <head>
          <title>ACME Bookmarks</title>
        </head>
        <h1>ACME Bookmarks +</h1>
        <body>
            <ul>
             ${bookmarks
               .map(
                 (bookmark) =>
                   `<li>${bookmark.name} <a href="/categories/${bookmark.categoryId}">${bookmark.category.name}</a></li>`
               )
               .join("")}
            </ul>
        </body>
       </html>`
    );
  } catch (ex) {
    next(ex);
  }
});

app.get("/categories/:id", async (req, res, next) => {
  try {
    const categories = await Category.findByPk(req.params.id, {
      include: [Bookmark],
    });

    res.send(
      `<html>
          <head>
              <title>Categories</title>
          </head>
          <body>
            <h1>ACME Bookmarks</h1>
            <a href='/bookmarks'>Back</a>
            <h2>${categories.name}</h2>
            ${categories.bookmarks
              .map(
                (bookmark) =>
                  `
              <li>${bookmark.name}
                <a href="">${categories.name}</a>
              </li>
              `
              )
              .join("")}
          </body>
         </html>`
    );
  } catch (ex) {
    next(ex);
  }
});

const start = async () => {
  try {
    await sequelize.sync({ force: true });

    //seeding category table/model
    const search = await Category.create({ name: "search" });
    const coding = await Category.create({ name: "coding" });
    const jobs = await Category.create({ name: "jobs" });

    //Bookmark.get()??
    //seeding bookmark table/model
    await Bookmark.create({ name: "google.com", categoryId: search.id });
    await Bookmark.create({ name: "stackoverflow.com", categoryId: coding.id });
    await Bookmark.create({ name: "bing.com", categoryId: search.id });
    await Bookmark.create({ name: "linkedin.com", categoryId: jobs.id });
    await Bookmark.create({ name: "indeed.com", categoryId: jobs.id });
    await Bookmark.create({ name: "msdn.com", categoryId: coding.id });

    console.log("starting");
    const port = process.env.PORT || 4000;

    app.listen(port, () => {
      console.log(`listening on port ${port}`);
    });
  } catch (ex) {
    console.log(ex);
  }
};

//console.log("hello!!");

start();

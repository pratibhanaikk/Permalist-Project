import express from 'express';
import bodyParser from 'body-parser';
import pg from 'pg';

const app = express();
const port = 3000;

const db = new pg.Client({
    user: 'postgres',
    hostname: 'localhost',
    database: 'checklist',
    password: '12@Arpush',
    port: 5433
});

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
db.connect();

let list = [];

async function todolist() {
    const data = await db.query("SELECT * FROM todolist");
    list = data.rows;
}

app.get("/", async (req, res) => {
    await todolist();
    console.log(list);
    res.render("index.ejs", { list });
});

app.post("/edit/:id", async (req, res) => {
    const task = req.body.updatedtask;
    const id = req.params.id;
    const data = await db.query('UPDATE todolist SET task = $1 WHERE id = $2 RETURNING *;', [task, id]);
    res.redirect("/");
});

app.post("/delete/:id", async (req, res) => {
    const id = req.params.id;
    await db.query("DELETE FROM todolist WHERE id = $1", [id]);
    res.redirect("/");
});

app.post("/newitem", async (req, res) => {
    const updatetask = req.body.newtask;
    console.log(req.body);
    await db.query("INSERT INTO todolist(task) VALUES($1) RETURNING *;", [updatetask]);
    res.redirect("/");
})

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
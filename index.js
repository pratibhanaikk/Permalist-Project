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
let userID = 1;

async function todolist(userID) {
    const data = await db.query("SELECT a.id, a.task, a.member_id FROM todolist AS a JOIN family_members AS b ON a.member_id=b.id WHERE b.id = $1 ORDER BY a.id ASC", [userID]);
    list = data.rows;
}
async function family_member(){
    const member = await db.query("SELECT * FROM family_members");
    const memberList = member.rows;
    return memberList;
}
async function member_name(userID){
    const member = await db.query("SELECT * FROM family_members");
    const memberList = member.rows;
    const name = memberList.find((m) => m.id == userID).name;
    return name;
}

app.get("/", async (req, res) => {
    await todolist(userID);
    const member =await family_member();
    const name =await member_name(userID);
    res.render("index.ejs", { list, member, name});
});

app.post("/loadlist", async (req, res) => {
    userID = req.body.memberId;
    console.log(req.body.memberId);
    res.redirect("/");
});

app.post("/edit/:id", async (req, res) => {
    const task = req.body.updatedtask;
    const id = req.params.id;
    console.log(task);
    const data = await db.query('UPDATE todolist SET task = $1 WHERE member_id = $2 AND id = $3 RETURNING *;', [task, userID, id]);
    res.redirect("/");
});

app.post("/delete/:id", async (req, res) => {
    const id = req.params.id;
    const data = await db.query("DELETE FROM todolist WHERE id = $1 AND member_id = $2 RETURNING *", [id, userID]);
    console.log(data);
    res.redirect("/");
});

app.post("/newitem", async (req, res) => {
    const updatetask = req.body.newtask;
    console.log(req.body);
    await db.query("INSERT INTO todolist(task, member_id) VALUES($1, $2) RETURNING *;", [updatetask, userID]);
    res.redirect("/");
})

app.post("/addnew", async (req, res) => {
    const name = req.body.membername;
    const data = await db.query("INSERT INTO family_members(name) VALUES ($1) RETURNING *;", [name]);
    res.redirect("/");
})

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
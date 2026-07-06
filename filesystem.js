// Reading a file
//const fs = require("fs");

/*fs.readFile("Sample.txt", (err,data) =>
{
    if(err)
    {
        console.error(err);
        return;
    }
    console.log(data);

});*/

// Writing a file
/*fs.writeFile("output.txt","Creating a file",(err) =>
{
    if(err) throw err;
    console.log("file written successfully");
});*/

const fs = require("fs");

const students = `
101,elwin,20
102,Alex,21
103,roy,22
`;

// 1. Write file
fs.writeFile("students.txt", students, (err) => {
    if (err) {

    console.error(err);
    return;
    } 

    console.log("written");

    // 2. Append file (after write completes)
    fs.appendFile("students.txt", "\n104,rahul,26", (err) => {
        if (err) 
        {
            console.error(err);
            return;
        }

        console.log("appended");

        // 3. Read file
        fs.readFile("students.txt", "utf8", (err, data) => {
            if (err) return console.error(err);

            console.log("before update:\n", data);

           // 4. Update specific student
            let updatedData = data.replace(
                
                "101,elwin,20",
                "101,Alex,21"
            );            

            // 5. Write updated file
            fs.writeFile("students.txt", updatedData, (err) => {
                if (err) return console.error(err);

                console.log("Student updated");
            });
        });
    });
});
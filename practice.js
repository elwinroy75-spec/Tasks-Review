/*let a = ["abc","bcd","cde","dfg","zxy"];
let b = ["alex", "elwin"];
let c = a.concat(b);
console.log("Combined Array:",c);*/

/*let a = Symbol("id");
let b = Symbol("id");
console.log(a==b);*/

//console.log([] == []);

/*let a = [1,2,3,4];
console.log(a.length);*/

/*let a = [1,2,3,4];
console.log(a.join("."));*/

/*let stud =
{
    reg_id: 24,
    name: "elwin",
    class: "4 BCA",
    col: "Christ"
}
console.log(delete stud.col);
console.log("Student Info:",stud);*/

/*let a = [1,2,3];
let b = [4,5,6];
let c = [7,8,9];
let d = [10,11,12];

let arr = a.concat(b,c,d);
console.log(arr);*/

/*let a = [1,2,3,4];
for(let i =0;i<a.length;i++)
{
    console.log(i);
}*/

/*let i = 0;

while(i<3)
{
    console.log(i);
    i++;
}*/

/*let i = 0;

do{
    console.log(i);
    i++;
} while(i<3)*/

/*let a = [1,2,3,4];

for(let b of a)
{
    console.log(b);
}*/

/*let emp =
{
    name: "elwin",
    age: 20
}

for(let key in emp)
{
    console.log(key, emp[key]);
}*/

/*let a = [1,2,3,4,5,6,7];
let b = a.slice(0,6);
console.log(b);*/

/*let a = [1,2,3,4];
let b= a.some((val)=> val > 4);
console.log(b);*/

/*let a = [1,2,3,4,5];
let b = a.filter(i => i % 2 === 0);
console.log(b);*/

/*let arr = ["qb","ab","sd"];

for(let i in arr)
{
    console.log(i,arr[i]);
}*/

/*let emp =  {

    name: "elwin",
    age: 21
}
for(let i in emp)
{
    console.log(i,emp[i]);
}*/

/*let obj = new Object();
obj.name = "Elwin";
obj.age = 21;
obj.course = "BCA";
 
let obj1 = {
    class: "6 BCA"
}

let obj2 = {...obj,...obj1};
console.log(obj2);
console.log(obj);
console.log(obj.name);
console.log(obj["age"]);
console.log("name" in obj);
console.log(obj.hasOwnProperty("model"));
console.log(Object.keys(obj2).length);*/


const users = [
  { id: 1, name: "John", age: 22, active: true },
  { id: 2, name: "Sara", age: 17, active: false },
  { id: 3, name: "Mike", age: 35, active: true },
  { id: 4, name: "Emma", age: 28, active: false },
  { id: 5, name: "David", age: 42, active: true }
];

//task 1 - Count Active Users
const activeCount = users.filter(user => user.active).length;
console.log(activeCount); 

// task 2 - Count inaactive users
const inactiveCount = users.filter(user => !user.active).length;
console.log(inactiveCount);

// task 3 - Find average age
const avgAge = users.reduce((sum, user) => sum + user.age, 0) / users.length;
console.log(avgAge);

// Find Old User
const oldestUser = users.reduce((oldest, user) =>
user.age > oldest.age ? user : oldest);
console.log(oldestUser);

// Find Youngest User
const youngUser = users.reduce((youngest,user) =>
user.age < youngest.age ? user : youngest);
console.log(youngUser);

// find only active users
const activeUsers = users.filter(user => user.active);
console.log(activeUsers);

// return user names
const names = users.map(user => user.name);
console.log(names);

// sort ages in descending order
const sortAge = users.sort((a, b) => b.age - a.age);
console.log(sortAge);


const API_URL = "https://ai-finance-backend-secure.onrender.com"
const token = localStorage.getItem("token");

async function checkTransactions() {

if (!token) {
alert("You must be logged in first.");
return;
}

try {

const res = await fetch(API_URL + "/transactions", {
  method: "GET",
  headers: {
    "Authorization": "Bearer " + token
  }
});

if (res.status === 401) {
  alert("Session expired. Please login again.");
  return;
}

const data = await res.json();

console.log("Transactions:", data);
alert("Transactions fetched successfully. Check console.");

} catch (err) {
console.error(err);
alert("Error fetching transactions.");
}
}
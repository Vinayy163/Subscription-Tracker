const SERVER_URL = "http://localhost:5500";

/* ---------------- Signup ---------------- */
const signupForm = document.getElementById("signupForm");
if (signupForm) {
  signupForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const name = document.getElementById("name").value;
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    try {
      const res = await fetch(`${SERVER_URL}/api/v1/auth/sign-up`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password })
      });

      const data = await res.json();
      if (res.ok) {
        document.getElementById("signupMessage").innerText = "Signup successful! Please login.";
      } else {
        document.getElementById("signupMessage").innerText = data.message || "Signup failed.";
      }
    } catch (err) {
      console.error("Signup error:", err);
    }
  });
}

/* ---------------- Login ---------------- */
const loginForm = document.getElementById("loginForm");
if (loginForm) {
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    try {
      const res = await fetch(`${SERVER_URL}/api/v1/auth/sign-in`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();

      if (res.ok) {
        localStorage.setItem("token", data.data.token);
        localStorage.setItem("userId", data.data.user._id);
        window.location.href = "dashboard.html";
      } else {
        document.getElementById("loginMessage").innerText = data.message || "Login failed.";
      }
    } catch (err) {
      console.error("Login error:", err);
    }
  });
}

/* ---------------- Dashboard ---------------- */
const subscriptionList = document.getElementById("subscriptionList");
if (subscriptionList) {
  document.addEventListener("DOMContentLoaded", async () => {
    await loadSubscriptions();
  });

  // Add subscription
  const subscriptionForm = document.getElementById("subscriptionForm");
  subscriptionForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const name = document.getElementById("subName").value;
    const price = document.getElementById("subPrice").value;
    const currency = document.getElementById("subCurrency").value;
    const frequency = document.getElementById("subFrequency").value;
    const category = document.getElementById("subCategory").value;
    const paymentMethod = document.getElementById("subPaymentMethod").value;
    const startDate = document.getElementById("subStartDate").value;
    const status = document.getElementById("subStatus").value;

    const token = localStorage.getItem("token");
    const userId = localStorage.getItem("userId");

    try {
      const res = await fetch(`${SERVER_URL}/api/v1/subscriptions`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          name,
          price,
          currency,
          frequency,
          category,
          paymentMethod,
          startDate,
          status,
          user: userId
        })
      });

      if (res.ok) {
        await loadSubscriptions(); // refresh list
        subscriptionForm.reset();
      } else {
        console.error("Failed to add subscription");
      }
    } catch (err) {
      console.error("Add subscription error:", err);
    }
  });
}

// Load subscriptions
async function loadSubscriptions() {
  const token = localStorage.getItem("token");
  const userId = localStorage.getItem("userId");

  if (!token) {
    window.location.href = "index.html";
    return;
  }

  try {
    const res = await fetch(`${SERVER_URL}/api/v1/subscriptions/user/${userId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    const data = await res.json();

    if (res.ok) {
      if (Array.isArray(data.data)) {
        subscriptionList.innerHTML = data.data.map(sub => `
          <li>
            <strong>${sub.name}</strong><br>
            Price: ${sub.price} ${sub.currency} | Status: ${sub.status}<br>
            Frequency: ${sub.frequency} | Category: ${sub.category}<br>
            Payment: ${sub.paymentMethod} | Start Date: ${new Date(sub.startDate).toLocaleDateString()}
          </li>
        `).join("");
      } else {
        subscriptionList.innerHTML = "<li>No subscriptions found.</li>";
      }
    } else {
      subscriptionList.innerHTML = `<li>${data.message || "Error loading subscriptions"}</li>`;
    }
  } catch (err) {
    console.error("Load subscriptions error:", err);
  }
}

/* ---------------- Logout ---------------- */
function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("userId");
  window.location.href = "index.html";
}

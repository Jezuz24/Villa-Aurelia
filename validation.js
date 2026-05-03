// =========================================================
// Villa Aurelia Main JavaScript File
// This file controls registration, login, booking, reviews,
// customer service messages, and admin booking management.
// =========================================================

// Default administrator account used for the class demo.
// NOTE: This is client-side simulation only. A real system would use a server and database.
const adminAccount = {
  email: "admin@villaaurelia.com",
  password: "admin123",
  accountType: "Administrator",
  firstName: "Jesus",
  lastName: "Lopez",
  bookings: []
};

// -------------------------------
// Booking form calculation
// -------------------------------
function calculateBooking() {
  // Get form input values from the booking page.
  let name = document.getElementById("name").value.trim();
  let email = document.getElementById("email").value.trim();
  let roomPrice = document.getElementById("room").value;
  let roomSelect = document.getElementById("room");
  let checkinValue = document.getElementById("checkin").value;
  let checkoutValue = document.getElementById("checkout").value;
  let checkin = new Date(checkinValue);
  let checkout = new Date(checkoutValue);
  let guests = document.getElementById("guests").value;
  let result = document.getElementById("result");

  // Basic empty-field validation.
  if (!name || !email || !roomPrice || !guests || isNaN(checkin) || isNaN(checkout)) {
    result.innerHTML = "Please fill out all booking fields.";
    result.className = "mt-6 text-center font-bold text-lg error-box";
    return;
  }

  // Simple email validation for the demo.
  if (!email.includes("@") || !email.includes(".")) {
    result.innerHTML = "Please enter a valid email address.";
    result.className = "mt-6 text-center font-bold text-lg error-box";
    return;
  }

  // Calculate the number of nights between check-in and check-out.
  let nights = (checkout - checkin) / (1000 * 60 * 60 * 24);

  if (nights <= 0) {
    result.innerHTML = "Check-out date must be after check-in date.";
    result.className = "mt-6 text-center font-bold text-lg error-box";
    return;
  }

  // Calculate the total booking price.
  let total = nights * Number(roomPrice);
  let currentUser = JSON.parse(localStorage.getItem("villaCurrentUser"));
  let roomTypeText = roomSelect.options[roomSelect.selectedIndex].text;

  // Booking object saved to localStorage.
  let bookingInfo = {
    bookingId: "VA-" + Date.now(),
    guestName: name,
    email: email,
    roomType: roomTypeText,
    roomPrice: Number(roomPrice),
    checkin: checkinValue,
    checkout: checkoutValue,
    nights: nights,
    guests: Number(guests),
    total: total,
    dateCreated: new Date().toLocaleDateString(),
    lastUpdated: new Date().toLocaleString(),
    status: "Pending"
  };

  // Save the most recent booking for quick reference.
  localStorage.setItem("villaBookingInfo", JSON.stringify(bookingInfo));

  // If a guest/customer is logged in, also save this booking into their account.
  if (currentUser && currentUser.accountType === "Guest/Customer") {
    let users = JSON.parse(localStorage.getItem("villaUsers")) || [];

    users = users.map(user => {
      if (user.email === currentUser.email) {
        user.bookings = user.bookings || [];
        user.bookings.push(bookingInfo);

        // Keep the currently logged-in user's profile updated.
        localStorage.setItem("villaCurrentUser", JSON.stringify(user));
      }
      return user;
    });

    localStorage.setItem("villaUsers", JSON.stringify(users));
  }

  // Show the confirmation message on the booking page.
  result.innerHTML =
    "<strong>Booking Submitted!</strong><br><br>" +
    "<strong>Booking ID:</strong> " + bookingInfo.bookingId +
    "<br><strong>Status:</strong> Pending Approval" +
    "<br><strong>Room:</strong> " + bookingInfo.roomType +
    "<br><strong>Check-in:</strong> " + bookingInfo.checkin +
    "<br><strong>Check-out:</strong> " + bookingInfo.checkout +
    "<br><strong>Nights:</strong> " + bookingInfo.nights +
    "<br><strong>Guests:</strong> " + bookingInfo.guests +
    "<br><strong>Total Price:</strong> $" + bookingInfo.total +
    "<br><br><a href='Profile.html' class='text-emerald-700 underline'>View Account Confirmation</a>";

  result.className = "mt-6 text-center font-bold text-lg success-box";
}

// -------------------------------
// Guest registration
// -------------------------------
function validateRegistration() {
  let firstName = document.getElementById("firstName").value.trim();
  let middleName = document.getElementById("middleName").value.trim();
  let lastName = document.getElementById("lastName").value.trim();
  let email = document.getElementById("regEmail").value.trim();
  let password = document.getElementById("password").value.trim();
  let confirmPassword = document.getElementById("confirmPassword").value.trim();
  let result = document.getElementById("registrationResult");

  // Make sure required fields are filled.
  if (!firstName || !lastName || !email || !password || !confirmPassword) {
    result.innerHTML = "Please fill out all required registration fields.";
    result.className = "mt-5 text-center font-bold error-box";
    return false;
  }

  if (!email.includes("@") || !email.includes(".")) {
    result.innerHTML = "Please enter a valid email address.";
    result.className = "mt-5 text-center font-bold error-box";
    return false;
  }

  if (password.length < 6) {
    result.innerHTML = "Password must be at least 6 characters long.";
    result.className = "mt-5 text-center font-bold error-box";
    return false;
  }

  if (password !== confirmPassword) {
    result.innerHTML = "Passwords do not match.";
    result.className = "mt-5 text-center font-bold error-box";
    return false;
  }

  let users = JSON.parse(localStorage.getItem("villaUsers")) || [];
  let existingUser = users.find(user => user.email === email);

  // Prevent duplicate accounts and prevent using the admin email.
  if (email === adminAccount.email || existingUser) {
    result.innerHTML = "An account with this email already exists.";
    result.className = "mt-5 text-center font-bold error-box";
    return false;
  }

  // Create a new guest account.
  let newUser = {
    firstName: firstName,
    middleName: middleName,
    lastName: lastName,
    email: email,
    password: password,
    accountType: "Guest/Customer",
    bookings: []
  };

  users.push(newUser);
  localStorage.setItem("villaUsers", JSON.stringify(users));

  result.innerHTML = "Registration successful! Redirecting to login...";
  result.className = "mt-5 text-center font-bold success-box";

  setTimeout(function () {
    window.location.href = "Login.html";
  }, 1200);

  return true;
}

// -------------------------------
// Login system
// -------------------------------
function loginUser() {
  let email = document.getElementById("loginEmail").value.trim();
  let password = document.getElementById("loginPassword").value.trim();
  let result = document.getElementById("loginResult");

  if (!email || !password) {
    result.innerHTML = "Please enter your email and password.";
    result.className = "mt-6 text-center font-bold error-box";
    return;
  }

  // Administrator login.
  if (email === adminAccount.email && password === adminAccount.password) {
    localStorage.setItem("villaLoggedIn", "true");
    localStorage.setItem("villaCurrentUser", JSON.stringify(adminAccount));

    result.innerHTML = "Administrator login successful!";
    result.className = "mt-6 text-center font-bold success-box";

    setTimeout(function () {
      window.location.href = "Profile.html";
    }, 1200);
    return;
  }

  // Guest/customer login.
  let users = JSON.parse(localStorage.getItem("villaUsers")) || [];
  let user = users.find(user => user.email === email && user.password === password);

  if (user) {
    localStorage.setItem("villaLoggedIn", "true");
    localStorage.setItem("villaCurrentUser", JSON.stringify(user));

    result.innerHTML = "Customer login successful!";
    result.className = "mt-6 text-center font-bold success-box";

    setTimeout(function () {
      window.location.href = "Profile.html";
    }, 1200);
  } else {
    result.innerHTML = "Invalid email or password.";
    result.className = "mt-6 text-center font-bold error-box";
  }
}

// -------------------------------
// Guest review form
// -------------------------------
function submitReview() {
  let name = document.getElementById("reviewName").value.trim();
  let rating = document.getElementById("rating").value;
  let review = document.getElementById("reviewText").value.trim();
  let result = document.getElementById("reviewResult");

  if (!name || !rating || !review) {
    result.innerHTML = "<p class='text-red-600 font-bold text-center'>Please fill out all review fields.</p>";
    return;
  }

  // Display the submitted review on the page.
  result.innerHTML =
    "<div class='bg-white p-5 rounded-xl border border-emerald-200'>" +
    "<p class='text-emerald-600 text-xl'>" + rating + "</p>" +
    "<h4 class='font-bold mt-2'>" + name + "</h4>" +
    "<p class='text-stone-600 mt-2'>" + review + "</p>" +
    "</div>";
}

// -------------------------------
// Customer service demo message
// -------------------------------
function showServiceMessage() {
  document.getElementById("serviceResult").innerText =
    "Your request has been submitted. Our team will contact you soon.";

  document.getElementById("serviceResult").className =
    "mt-5 text-center font-bold success-box";
}

// -------------------------------
// Show logged-in user's name in navbar
// -------------------------------
function showNavbarUser() {
  let loggedIn = localStorage.getItem("villaLoggedIn");
  let currentUser = JSON.parse(localStorage.getItem("villaCurrentUser"));
  let navUser = document.getElementById("navUser");

  if (navUser && loggedIn === "true" && currentUser) {
    navUser.innerHTML = "🌿 " + currentUser.firstName;
  }
}

window.addEventListener("load", showNavbarUser);

// -------------------------------
// Administrator: remove guest account
// -------------------------------
function removeGuestAccount(email) {
  let confirmDelete = confirm("Are you sure you want to remove this guest account?");
  if (!confirmDelete) return;

  let users = JSON.parse(localStorage.getItem("villaUsers")) || [];
  users = users.filter(user => user.email !== email);

  localStorage.setItem("villaUsers", JSON.stringify(users));

  alert("Guest account removed successfully.");
  location.reload();
}

// -------------------------------
// Administrator: cancel one guest booking
// -------------------------------
function cancelGuestBooking(email, bookingIndex) {
  let confirmCancel = confirm("Are you sure you want to cancel this booking?");
  if (!confirmCancel) return;

  let users = JSON.parse(localStorage.getItem("villaUsers")) || [];
  let cancelledBooking = null;

  users = users.map(user => {
    if (user.email === email && user.bookings) {
      cancelledBooking = user.bookings[bookingIndex];
      user.bookings.splice(bookingIndex, 1);
    }
    return user;
  });

  localStorage.setItem("villaUsers", JSON.stringify(users));

  // Keep current user updated if the removed booking belongs to the logged-in user.
  let currentUser = JSON.parse(localStorage.getItem("villaCurrentUser"));
  if (currentUser && currentUser.email === email) {
    let updatedUser = users.find(user => user.email === email);
    localStorage.setItem("villaCurrentUser", JSON.stringify(updatedUser));
  }

  // Clear global latest booking if it was cancelled.
  let latestBooking = JSON.parse(localStorage.getItem("villaBookingInfo"));
  if (latestBooking && cancelledBooking && latestBooking.bookingId === cancelledBooking.bookingId) {
    localStorage.removeItem("villaBookingInfo");
  }

  alert("Booking cancelled successfully.");
  location.reload();
}

// -------------------------------
// Administrator: approve or reject a booking
// -------------------------------
function updateBookingStatus(email, index, status) {
  let users = JSON.parse(localStorage.getItem("villaUsers")) || [];
  let userIndex = users.findIndex(u => u.email === email);

  if (userIndex === -1 || !users[userIndex].bookings || !users[userIndex].bookings[index]) {
    alert("Booking was not found.");
    return;
  }

  users[userIndex].bookings[index].status = status;
  users[userIndex].bookings[index].lastUpdated = new Date().toLocaleString();

  // If the global latest booking is the same booking, update its status too.
  let latestBooking = JSON.parse(localStorage.getItem("villaBookingInfo"));

  if (latestBooking && latestBooking.bookingId === users[userIndex].bookings[index].bookingId) {
    latestBooking.status = status;
    latestBooking.lastUpdated = users[userIndex].bookings[index].lastUpdated;
    localStorage.setItem("villaBookingInfo", JSON.stringify(latestBooking));
  }

  // If the edited user is currently logged in, update their active session.
  let currentUser = JSON.parse(localStorage.getItem("villaCurrentUser"));
  if (currentUser && currentUser.email === email) {
    localStorage.setItem("villaCurrentUser", JSON.stringify(users[userIndex]));
  }

  localStorage.setItem("villaUsers", JSON.stringify(users));

  alert("Booking " + status);
  location.reload();
}

// -------------------------------
// Administrator: edit booking guests and nights
// -------------------------------
function editBooking(email, index) {
  let users = JSON.parse(localStorage.getItem("villaUsers")) || [];
  let user = users.find(u => u.email === email);

  if (!user || !user.bookings || !user.bookings[index]) {
    alert("Booking was not found.");
    return;
  }

  let booking = user.bookings[index];

  let newGuests = prompt("Enter new number of guests:", booking.guests);
  let newNights = prompt("Enter new number of nights:", booking.nights);

  if (!newGuests || !newNights) return;

  booking.guests = Number(newGuests);
  booking.nights = Number(newNights);
  booking.total = booking.nights * Number(booking.roomPrice);
  booking.lastUpdated = new Date().toLocaleString();

  localStorage.setItem("villaUsers", JSON.stringify(users));

  // Keep current user and latest booking synced.
  let currentUser = JSON.parse(localStorage.getItem("villaCurrentUser"));
  if (currentUser && currentUser.email === email) {
    localStorage.setItem("villaCurrentUser", JSON.stringify(user));
  }

  let latestBooking = JSON.parse(localStorage.getItem("villaBookingInfo"));
  if (latestBooking && latestBooking.bookingId === booking.bookingId) {
    localStorage.setItem("villaBookingInfo", JSON.stringify(booking));
  }

  alert("Booking updated!");
  location.reload();
}

const courses = [
  "Computer Science",
  "Software Engineering",
  "Digital Marketing",
  "Business Management",
  "Psychology",
];

const input = document.querySelector(".course-input");
const dropdown = document.querySelector(".course-dropdown");

input.addEventListener("input", () => {
  const value = input.value.toLowerCase();

  dropdown.innerHTML = "";

  if (!value) {
    dropdown.classList.remove("active");
    return;
  }

  const filtered = courses.filter((c) => c.toLowerCase().includes(value));

  filtered.forEach((course) => {
    const li = document.createElement("li");
    li.textContent = course;

    li.addEventListener("click", () => {
      input.value = course;
      dropdown.classList.remove("active");
    });

    dropdown.appendChild(li);
  });

  dropdown.classList.toggle("active", filtered.length > 0);
});

document.addEventListener("click", (e) => {
  if (!e.target.closest(".course-wrapper")) {
    dropdown.classList.remove("active");
  }
});

// Continue buuton handler and validation for step 1
const firstName = document.querySelector("input[name='firstName']");
const lastName = document.querySelector("input[name='lastName']");
const role = document.querySelector("select[name='role']");
const buttons = document.querySelectorAll(".continue-btn");

function getActiveButton() {
  return buttons[currentStep];
}

function validateStep1() {
  if (currentStep != 0) return;
  console.log("Validating step 1...")
  const firstValid = firstName.value.trim().length > 0;
  const lastValid = lastName.value.trim().length > 0;
  const roleValid = role.value.trim().length > 0;

  // ERROR
  firstName.classList.toggle("error", !firstValid);
  lastName.classList.toggle("error", !lastValid);
  role.classList.toggle("error", !roleValid);

  // SUCCESS
  firstName.classList.toggle("success", firstValid);
  lastName.classList.toggle("success", lastValid);
  role.classList.toggle("success", roleValid);

  // color select
  role.classList.toggle("filled", roleValid);

  const isValid = firstValid && lastValid && roleValid;

  getActiveButton().disabled = !isValid;
  getActiveButton().classList.toggle("active", isValid);

  return isValid;
}

[firstName, lastName, role].forEach((el) => {
  console.log("Loading step 1 items...")
  el.addEventListener("input", validateStep1);
  el.addEventListener("change", validateStep1);
});

// Switching steps
const steps = document.querySelectorAll(".step");
let currentStep = 0;

function isStepValid() {
  if (currentStep === 0) return validateStep1();
  if (currentStep === 1) return validateStep2();
}

getActiveButton().addEventListener("click", () => {
  if (!isStepValid()) return;

  steps[currentStep].classList.remove("active");
  currentStep++;
  steps[currentStep].classList.add("active");

  updateProgressBar();
  
  if (currentStep === 1) validateStep2();
});

// Progress bar
const dots = document.querySelectorAll(".dot-step");

function updateProgressBar() {
  dots.forEach((dot, index) => {
    dot.classList.toggle("active", index === currentStep);
    dot.classList.toggle("done", index < currentStep);
  });
}

// Back button handler
const backBtn = document.querySelector(".back-btn");

backBtn.addEventListener("click", () => {
  if (currentStep === 0) {
    window.location.href = "/login";
    return;
  }

  steps[currentStep].classList.remove("active");
  currentStep--;

  steps[currentStep].classList.add("active");

  updateProgressBar();
});

const email = document.querySelector("input[name='email']");
const password = document.querySelector("input[name='password']");
const confirmPassword = document.querySelector("input[name='confirmPassword']");

function isValidUniversityEmail(email) {
  return /^[^\s@]+@roehampton\.ac\.uk$/.test(email);
}

function isValidPassword(password) {
  return /^(?=.*[A-Za-z])(?=.*\d).{6,}$/.test(password);
}

function validateStep2() {
  const isActive = currentStep === 1;
  if (isActive) {
    console.log("Validating step 2...")
    const emailValid = isValidUniversityEmail(email.value.trim());
    const passwordValid = isValidPassword(password.value.trim());
    const match =
      password.value === confirmPassword.value && password.value.length > 0;

    // ERROR
    email.classList.toggle("error", !emailValid);
    password.classList.toggle("error", !passwordValid);
    confirmPassword.classList.toggle("error", !match);

    // SUCCESS
    email.classList.toggle("success", emailValid);
    password.classList.toggle("success", passwordValid);
    confirmPassword.classList.toggle("success", match);

    if (!emailValid) {
      email.setCustomValidity("Use your university email");
    } else {
      email.setCustomValidity("");
    }
    console.log(emailValid, passwordValid, match)

    const isValid = emailValid && passwordValid && match;

    if (isActive) {
      getActiveButton().disabled = !isValid;
      getActiveButton().classList.toggle("active", isValid);
    }

    return isValid;
  }
  return false;
}

[email, password, confirmPassword].forEach((el) => {
  console.log("Loading step 2 items...")
  el.addEventListener("input", validateStep2);
  el.addEventListener("change", validateStep2);
});

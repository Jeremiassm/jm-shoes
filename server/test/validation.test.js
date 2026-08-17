const test = require("node:test");
const assert = require("node:assert/strict");
const { validateSneakerInput, validateLogin } = require("../lib/validation");

const validSneaker = {
  name: "Air Jordan 1",
  brand: "Nike",
  price: 199.99,
  description: "Classic sneaker",
  images: ["/uploads/a.webp"],
  video: "/uploads/v.mp4",
  sizes: [40, 41, 42],
  review: { traction: 8, cushion: 7, materials: 9, durability: 8, fit: 7 },
  pros: ["comfortable"],
  cons: ["expensive"],
};

test("validateSneakerInput returns 0 errors for a complete valid body", () => {
  const errors = validateSneakerInput(validSneaker);
  assert.deepEqual(errors, []);
});

test("validateSneakerInput reports missing name", () => {
  const body = { ...validSneaker };
  delete body.name;
  const errors = validateSneakerInput(body);
  assert.equal(errors.length, 1);
  assert.match(errors[0], /name/);
});

test("validateSneakerInput reports negative price", () => {
  const errors = validateSneakerInput({ ...validSneaker, price: -10 });
  assert.equal(errors.length, 1);
  assert.match(errors[0], /price/);
});

test("validateSneakerInput reports review with invalid key", () => {
  const errors = validateSneakerInput({
    ...validSneaker,
    review: { traction: 8, bogus: 5 },
  });
  assert.equal(errors.length, 1);
  assert.match(errors[0], /review/);
});

test("validateSneakerInput reports sizes that are not numbers", () => {
  const errors = validateSneakerInput({ ...validSneaker, sizes: ["abc"] });
  assert.equal(errors.length, 1);
  assert.match(errors[0], /sizes/);
});

test("validateSneakerInput accepts missing optional fields", () => {
  const errors = validateSneakerInput({
    name: "X",
    brand: "Nike",
    price: 10,
  });
  assert.deepEqual(errors, []);
});

test("validateLogin returns 0 errors for valid input", () => {
  const errors = validateLogin({ username: "admin", password: "admin123" });
  assert.deepEqual(errors, []);
});

test("validateLogin reports missing username", () => {
  const errors = validateLogin({ password: "x" });
  assert.equal(errors.length, 1);
  assert.match(errors[0], /username/);
});

test("validateLogin reports password longer than 200 chars", () => {
  const errors = validateLogin({ username: "admin", password: "a".repeat(201) });
  assert.equal(errors.length, 1);
  assert.match(errors[0], /password/);
});

test("validateLogin reports empty password", () => {
  const errors = validateLogin({ username: "admin", password: "" });
  assert.equal(errors.length, 1);
  assert.match(errors[0], /password/);
});

test("validateLogin reports both username and password errors together", () => {
  const errors = validateLogin({});
  assert.equal(errors.length, 2);
});

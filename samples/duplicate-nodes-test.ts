// Test file for duplicate nodes
const value = 42; // Same content
let result = value + 1;

// Another function with duplicate token
function test() {
  const value = 42; // Same 'const' token and same 'value' identifier and same '42' token
  return value;
}

// More duplicates
if (value > 0) {
  console.log(value); // 'value' identifier appears multiple times
}

// Same identifier 'value' used again
const newValue = value * 2;

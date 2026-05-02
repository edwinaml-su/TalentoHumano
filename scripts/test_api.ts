async function runApiTest() {
  const res = await fetch('http://localhost:3000/api/localization/tax-tables?country=SV&frequency=MONTHLY');
  if (!res.ok) {
    console.log("Error status:", res.status);
    console.log("Body:", await res.text());
    return;
  }
  const data = await res.json();
  console.log("API Result Brackets:", data?.brackets?.length || 0);
}

runApiTest();

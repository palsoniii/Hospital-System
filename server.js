const express = require("express");
const { createClient } = require("@supabase/supabase-js");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

// CORS configuration
const corsOptions = {
  origin: [
    'http://localhost:3000',  // For local development
    'https://hospital-system-phi.vercel.app',  // Replace with your actual Vercel URL
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));

// Supabase client initialization
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

// Routes
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.get("/appointments", async (req, res) => {
  try {
    const { data, error } = await supabase.from("appointments").select("*");

    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send("Error fetching appointments");
  }
});

app.post("/appointments", async (req, res) => {
  const { department, doctor, appointment_date, appointment_time } = req.body;

  if (!department || !doctor || !appointment_date || !appointment_time) {
    return res.status(400).json({ error: "All fields are required" });
  }

  try {
    const { data, error } = await supabase.from("appointments").insert([
      {
        department,
        doctor,
        appointment_date,
        appointment_time,
      },
    ]);

    if (error) throw error;
    res.status(201).json({ message: "Appointment scheduled successfully" });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Error scheduling appointment" });
  }
});

app.get("/appointments/history", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("appointments")
      .select("*")
      .order("appointment_date", { ascending: false });

    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send("Error fetching appointment history");
  }
});

// Cart/Pharmacy Routes
app.get("/cart", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("cart")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Error fetching cart items" });
  }
});

app.post("/cart", async (req, res) => {
  const { medicine_name, quantity, price_per_unit } = req.body;

  if (!medicine_name || !quantity || !price_per_unit) {
    return res.status(400).json({ error: "All fields are required" });
  }

  try {
    const total_price = quantity * price_per_unit;
    const { data, error } = await supabase.from("cart").insert([
      {
        medicine_name,
        quantity,
        price_per_unit,
        total_price,
      },
    ]);

    if (error) throw error;
    res.status(201).json({ message: "Item added to cart successfully" });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Error adding item to cart" });
  }
});

app.delete("/cart/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const { error } = await supabase.from("cart").delete().eq("id", id);

    if (error) throw error;
    res.json({ message: "Item removed successfully" });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Error removing item from cart" });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

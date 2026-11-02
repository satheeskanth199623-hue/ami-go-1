import React, { useState, useEffect } from "react";
import {
  Car,
  MapPin,
  ShieldCheck,
  ArrowRight,
  LogOut
} from "lucide-react";

import { supabase } from "./supabase.js";

export default function App() {
  const [language, setLanguage] = useState("en");
  const [role, setRole] = useState("customer");

  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [phone, setPhone] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const translations = {
    en: {
      tagline: "Your Journey, Our Priority",
      welcome: "Welcome to AMI GO",
      subtitle: "Ride anywhere. Anytime.",
      customer: "Customer",
      driver: "Driver",
      admin: "Admin",
      phone: "Mobile Number",
      google: "Continue with Google",
      save: "Save Phone Number",
      logout: "Logout",
      secure: "Safe & Secure Rides",
      description: "Your trusted travel partner in Sri Lanka",
      profile: "Customer Profile",
      future: "This login option will be available soon.",
      saved: "Phone number saved successfully!",
      enterPhone: "Please enter your mobile number."
    },

    ta: {
      tagline: "உங்கள் பயணம் எங்கள் பொறுப்பு",
      welcome: "AMI GO-விற்கு வரவேற்கிறோம்",
      subtitle: "எங்கும் பயணம் செய்யுங்கள்.",
      customer: "வாடிக்கையாளர்",
      driver: "Driver",
      admin: "நிர்வாகி",
      phone: "தொலைபேசி எண்",
      google: "Google மூலம் தொடரவும்",
      save: "தொலைபேசி எண்ணை சேமிக்கவும்",
      logout: "வெளியேறு",
      secure: "பாதுகாப்பான பயணம்",
      description: "இலங்கையின் நம்பகமான பயண சேவை",
      profile: "வாடிக்கையாளர் விபரம்",
      future: "இந்த Login வசதி விரைவில் கிடைக்கும்.",
      saved: "தொலைபேசி எண் வெற்றிகரமாக சேமிக்கப்பட்டது!",
      enterPhone: "தொலைபேசி எண்ணை உள்ளிடவும்."
    },

    si: {
      tagline: "ඔබේ ගමන අපේ වගකීමයි",
      welcome: "AMI GO වෙත සාදරයෙන් පිළිගනිමු",
      subtitle: "ඕනෑම තැනකට ගමන් කරන්න.",
      customer: "පාරිභෝගිකයා",
      driver: "රියදුරු",
      admin: "පරිපාලක",
      phone: "දුරකථන අංකය",
      google: "Google සමඟ ඉදිරියට යන්න",
      save: "දුරකථන අංකය සුරකින්න",
      logout: "පිටවීම",
      secure: "ආරක්ෂිත ගමන්",
      description: "ශ්‍රී ලංකාවේ විශ්වාසදායක ගමන් සේවාව",
      profile: "පාරිභෝගික විස්තර",
      future: "මෙම Login පහසුකම ඉක්මනින් ලබා දෙනු ඇත.",
      saved: "දුරකථන අංකය සාර්ථකව සුරකින ලදී!",
      enterPhone: "දුරකථන අංකය ඇතුළත් කරන්න."
    }
  };

  const t = translations[language];

  // Load customer profile
  async function loadProfile(currentUser) {
    const { data, error } = await supabase
      .from("profiles")
      .select("full_name, email, phone")
      .eq("id", currentUser.id)
      .maybeSingle();

    if (error) {
      setMessage(error.message);
      return;
    }

    setProfile(data);

    if (data?.phone) {
      setPhone(data.phone);
    }
  }

  // Check Google Login
  useEffect(() => {
    let mounted = true;

    async function initialize() {
      const { data } = await supabase.auth.getSession();

      if (mounted && data.session?.user) {
        setUser(data.session.user);
        await loadProfile(data.session.user);
      }

      if (mounted) {
        setLoading(false);
      }
    }

    initialize();

    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (!mounted) return;

        const currentUser = session?.user || null;

        setUser(currentUser);
        setMessage("");

        if (currentUser) {
          await loadProfile(currentUser);
        } else {
          setProfile(null);
          setPhone("");
        }

        setLoading(false);
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // Google Login
  async function googleLogin() {
    setMessage("");

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: window.location.origin
      }
    });

    if (error) {
      setMessage(error.message);
    }
  }

  // Save Phone Number
  async function savePhone(e) {
    e.preventDefault();

    if (!phone.trim()) {
      setMessage(t.enterPhone);
      return;
    }

    if (!/^\+?[0-9\s-]{9,15}$/.test(phone.trim())) {
      setMessage("Please enter a valid phone number.");
      return;
    }

    if (!user) return;

    setSaving(true);
    setMessage("");

    const { data, error } = await supabase
      .from("profiles")
      .update({
        phone: phone.trim()
      })
      .eq("id", user.id)
      .select()
      .single();

    if (error) {
      setMessage(error.message);
    } else {
      setProfile(data);
      setMessage(t.saved);
    }

    setSaving(false);
  }

  // Logout
  async function logout() {
    const { error } = await supabase.auth.signOut();

    if (error) {
      setMessage(error.message);
    }
  }

  if (loading) {
    return (
      <div className="app">
        <h2>AMI GO Loading...</h2>
      </div>
    );
  }

  return (
    <div className="app">

      <header className="header">

        <div className="logo">
          <span>AMI</span> GO<span className="dot">.</span>
        </div>

        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          className="language"
        >
          <option value="en">English</option>
          <option value="ta">தமிழ்</option>
          <option value="si">සිංහල</option>
        </select>

      </header>

      <main className="main">

        <section className="hero">

          <div className="hero-icon">
            <Car size={55} />
          </div>

          <h1>AMI GO</h1>

          <h2>{t.tagline}</h2>

          <p>{t.description}</p>

          <div className="features">
            <span>
              <MapPin size={16} />
              GPS Tracking
            </span>

            <span>
              <ShieldCheck size={16} />
              {t.secure}
            </span>
          </div>

        </section>

        <section className="login-card">

          <h2>{t.welcome}</h2>

          <p className="subtitle">
            {t.subtitle}
          </p>

          <div className="role-tabs">

            <button
              className={role === "customer" ? "active" : ""}
              onClick={() => setRole("customer")}
            >
              {t.customer}
            </button>

            <button
              className={role === "driver" ? "active" : ""}
              onClick={() => setRole("driver")}
            >
              {t.driver}
            </button>

            <button
              className={role === "admin" ? "active" : ""}
              onClick={() => setRole("admin")}
            >
              {t.admin}
            </button>

          </div>

          {role !== "customer" ? (

            <p>{t.future}</p>

          ) : user ? (

            <div className="customer-profile">

              <h3>{t.profile}</h3>

              <p>
                <strong>Name:</strong>{" "}
                {profile?.full_name ||
                  user.user_metadata?.full_name ||
                  user.user_metadata?.name ||
                  "Customer"}
              </p>

              <p>
                <strong>Email:</strong>{" "}
                {user.email}
              </p>

              <form onSubmit={savePhone}>

                <label>{t.phone}</label>

                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+94 7XXXXXXXX"
                  required
                />

                <button
                  type="submit"
                  className="login-button"
                  disabled={saving}
                >
                  {saving ? "Saving..." : t.save}
                  <ArrowRight size={18} />
                </button>

              </form>

              <button
                className="google-button"
                onClick={logout}
              >
                <LogOut size={18} />
                {t.logout}
              </button>

            </div>

          ) : (

            <button
              className="google-button"
              onClick={googleLogin}
            >
              {t.google}
            </button>

          )}

          {message && (
            <p className="status-message">
              {message}
            </p>
          )}

        </section>

      </main>

      <footer>
        © 2026 AMI GO. All Rights Reserved.
      </footer>

    </div>
  );
}

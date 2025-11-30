import React from "react";
import headerImg from "../../assets/imgs/header.jpg";
import logo from "../../assets/imgs/quizzanalogo.png";
import "./TopBar.css";

export default function TopBar({ onBack }) {
  return (
    <header className="wr-header">
      {onBack && (
        <button className="wr-back" onClick={onBack} aria-label="Voltar">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#222" strokeWidth="2">
            <path d="M15 18l-6-6 6-6"></path>
          </svg>
        </button>
      )}

      {/* barra decorativa */}
      <div
        className="wr-header-bar"
        style={{
          backgroundImage: `url(${headerImg})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />

      {/* logo */}
      <img src={logo} alt="Logo" className="wr-logo" />
    </header>
  );
}

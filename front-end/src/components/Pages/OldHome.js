import React, { useEffect, useRef } from "react";
import "../../css/HomePage.css";

// Import images directly
import apple from "../../Images/apple.png";
import banana from "../../Images/banana.png";
import orange from "../../Images/orange.png";
import strawberry from "../../Images/strawberry.png";
import clock from "../../Images/clock.png";
import insights from "../../Images/insights.png";
import success from "../../Images/success.png";

const FRUITS = [
  { src: apple, alt: "Apple", className: "fruit fruit-1" },
  { src: banana, alt: "Banana", className: "fruit fruit-2" },
  { src: orange, alt: "Orange", className: "fruit fruit-3" },
  { src: strawberry, alt: "Strawberry", className: "fruit fruit-4" },
];

const FEATURES = [
  {
    icon: success,
    text: "Feature 1",
    fruit: {
      src: apple,
      alt: "Apple",
      className: "circle-fruit circle-fruit-left",
    },
  },
  { icon: insights, text: "Feature 2" },
  {
    icon: clock,
    text: "Feature 3",
    fruit: {
      src: banana,
      alt: "Banana",
      className: "circle-fruit circle-fruit-right",
    },
  },
];

const SMALL_FRUITS = [
  { src: orange, alt: "Orange", className: "small-fruit small-fruit-1" },
  {
    src: strawberry,
    alt: "Strawberry",
    className: "small-fruit small-fruit-2",
  },
];

const Home = () => {
  const sectionRefs = {
    upper: useRef(null),
    lower: useRef(null),
    smallCircle: useRef(null),
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("animate");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );

    Object.values(sectionRefs).forEach((ref) => {
      if (ref.current) observer.observe(ref.current);
    });

    return () => {
      Object.values(sectionRefs).forEach((ref) => {
        if (ref.current) observer.unobserve(ref.current);
      });
    };
  }, []);

  const renderFruits = (fruits) =>
    fruits.map((fruit, index) => (
      <img
        key={index}
        src={fruit.src}
        alt={fruit.alt}
        className={fruit.className}
      />
    ));

  const renderFeatures = () =>
    FEATURES.map((feature, index) => (
      <div
        key={index}
        className={`circle ${index === 1 ? "middle-circle" : ""}`}
      >
        <img
          src={feature.icon}
          alt={`Feature ${index + 1}`}
          className="circle-icon"
        />
        <p>{feature.text}</p>
        {feature.fruit && (
          <img
            src={feature.fruit.src}
            alt={feature.fruit.alt}
            className={feature.fruit.className}
          />
        )}
      </div>
    ));

  return (
    <div className="home-container">
      <section className="upper-section" ref={sectionRefs.upper}>
        <div className="content-wrapper">
          <div className="left-content">
            <h1 className="welcome-text">
              <span className="welcome-to">Welcome to</span>
              <br />
              <span className="fitness-tracker">Fitness-Tracker</span>
            </h1>
            <button className="get-started-button">Get Started</button>
          </div>
        </div>
        <div className="green-circle">{renderFruits(FRUITS)}</div>
      </section>

      <section className="lower-section" ref={sectionRefs.lower}>
        <h2 className="why-fitness">Why Fitness Tracker?</h2>
        <div className="circle-container">{renderFeatures()}</div>
      </section>

      <div
        className="small-green-circle-container"
        ref={sectionRefs.smallCircle}
      >
        <div className="small-green-circle"></div>
        {renderFruits(SMALL_FRUITS)}
      </div>

      <div className="quote-section">
        <h3 className="quote-name">John Doe</h3>
        <p className="quote-text">
          "This is a placeholder for an inspiring quote about fitness and
          health."
        </p>
      </div>
    </div>
  );
};

export default Home;

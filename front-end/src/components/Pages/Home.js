import React, { useEffect, useRef } from "react";
import "../../css/HomePage.css";

//Images
import apple from "../../Images/apple.png";
import banana from "../../Images/banana.png";
import orange from "../../Images/orange.png";
import strawberry from "../../Images/strawberry.png";
import clock from "../../Images/clock.png";
import statistics from "../../Images/statistics.png";
import success from "../../Images/success.png";

const Home = () => {
  const infoTabsRef = useRef([]);
  const bottomLeftCircleRef = useRef(null);
  const userReviewRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );

    infoTabsRef.current.forEach((tab) => {
      if (tab) {
        observer.observe(tab);
      }
    });

    if (bottomLeftCircleRef.current) {
      observer.observe(bottomLeftCircleRef.current);
      for (let i = 0; i < bottomLeftCircleRef.current.children.length; i++) {
        observer.observe(bottomLeftCircleRef.current.children[i]);
      }
    }

    if (userReviewRef.current) {
      for (let i = 0; i < userReviewRef.current.children.length; i++) {
        observer.observe(userReviewRef.current.children[i]);
      }
    }

    return () => {
      infoTabsRef.current.forEach((tab) => {
        if (tab) {
          observer.unobserve(tab);
        }
      });

      if (bottomLeftCircleRef.current) {
        observer.unobserve(bottomLeftCircleRef.current);
        for (let i = 0; i < bottomLeftCircleRef.current.children.length; i++) {
          observer.unobserve(bottomLeftCircleRef.current.children[i]);
        }
      }

      if (userReviewRef.current) {
        observer.unobserve(userReviewRef.current);
      }
    };
  }, []);

  return (
    <div className="home-container">
      <div class="hero-container">
        <h1 className="welcome-text">
          <span className="greeting-text">Welcome to</span>
          <br />
          <span className="brand-name">Fitness-Tracker</span>
          <br />
          <button className="get-started-button">
            <span>Get Started</span>
          </button>
        </h1>
        <div className="green-circle">
          <img key="1" src={apple} alt="Fruit-1" className="fruit-1" />
          <img key="2" src={strawberry} alt="Fruit-2" className="fruit-2" />
          <img key="3" src={orange} alt="Fruit-3" className="fruit-3" />
          <img key="4" src={banana} alt="Fruit-4" className="fruit-4" />
        </div>
      </div>

      <div className="content-container">
        <div className="about-us">
          <h1>Why Fitness Tracker?</h1>
          <div
            className="info-tab1 info-tab"
            ref={(el) => (infoTabsRef.current[0] = el)}
          >
            <img
              key="1"
              src={statistics}
              alt="Statistics"
              className="statistics"
            />

            <img key="2" src={orange} alt="Fruit-3" className="fruit-3" />
            <p>Personalize</p>
          </div>
          <div
            className="info-tab2 info-tab"
            ref={(el) => (infoTabsRef.current[1] = el)}
          >
            <img key="1" src={success} alt="Success" className="success" />

            <p>Achieve</p>
          </div>
          <div
            className="info-tab3 info-tab"
            ref={(el) => (infoTabsRef.current[2] = el)}
          >
            <img key="1" src={clock} alt="Clock" className="clock" />

            <img key="2" src={banana} alt="Fruit-4" className="fruit-4" />
            <p>Track</p>
          </div>
        </div>
        <div className="user-reviews">
          <div
            className="bottom-left-circle"
            ref={(el) => (bottomLeftCircleRef.current = el)}
          >
            <img key="1" src={strawberry} alt="Fruit-1" className="fruit-1" />
            <img key="2" src={apple} alt="Fruit-2" className="fruit-2" />
          </div>
          <div
            ref={(el) => (userReviewRef.current = el)}
            className="user-review-container"
          >
            <h1 className="drop-in">John Doe</h1>
            <p className="drop-in-2">
              "I love this app! It helps me stay on track with my fitness goals.
              The personalized workout plans are amazing!"
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;

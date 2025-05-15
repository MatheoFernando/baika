"use client";

import { requireAuth } from "@/src/lib/authGuard";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";
import Image from "next/image";

const Dashboard: React.FC = () => {
  const router = useRouter();

  useEffect(() => {
    // Move navbarStyle logic from inline script to useEffect
    const navbarStyle = localStorage.getItem("navbarStyle");
    if (navbarStyle && navbarStyle !== "transparent") {
      document
        .querySelector(".navbar-vertical")
        ?.classList.add(`navbar-${navbarStyle}`);
    }

  }, [router]);

  return (
    <main className="main" id="top">
      <div className="container" data-layout="container">
        <nav className="navbar navbar-light navbar-vertical navbar-expand-xl">
          <div className="d-flex align-items-center">
            <div className="toggle-icon-wrapper">
              <button
                className="btn navbar-toggler-humburger-icon navbar-vertical-toggle"
                data-bs-toggle="tooltip"
                data-bs-placement="left"
                title="Toggle Navigation"
              >
                <span className="navbar-toggle-icon">
                  <span className="toggle-line"></span>
                </span>
              </button>
            </div>
            <Link className="navbar-brand" href="/">
              <div className="d-flex align-items-center py-3">
                <Image
                  src="/assets/img/icons/spot-illustrations/logo.png"
                  alt="Logo"
                  width={100}
                  height={100}
                  priority
                />
              </div>
            </Link>
          </div>
          <div className="collapse navbar-collapse" id="navbarVerticalCollapse">
            <div className="navbar-vertical-content scrollbar">
              <ul className="navbar-nav flex-column mb-3" id="navbarVerticalNav">
                <li className="nav-item">
                  <div className="row navbar-vertical-label-wrapper mt-3 mb-2">
                    <div class cy="Menu" />
                    <div className="col ps-0">
                      <hr className="mb-0 navbar-vertical-divider" />
                    </div>
                  </div>
                  <Link className="nav-link" href="/app/calendar" role="button">
                    <div className="d-flex align-items-center">
                      <span className="nav-link-icon"></span>
                      <span className="nav-link-text ps-1">Calendar</span>
                    </div>
                  </Link>
                  <Link className="nav-link" href="/" role="button">
                    <div className="d-flex align-items-center">
                      <span className="nav-link-icon">
                        <span className="fas fa-chart-pie"></span>
                      </span>
                      <span className="nav-link-text ps-1">Início</span>
                    </div>
                  </Link>
                </li>
                <li className="nav-item">
                  <a
                    className="nav-link dropdown-indicator"
                    href="#user"
                    role="button"
                    data-bs-toggle="collapse"
                    aria-expanded="false"
                    aria-controls="user"
                  >
                    <div className="d-flex align-items-center">
                      <span className="nav-link-icon">
                        <span className="fas fa-user"></span>
                      </span>
                      <span className="nav-link-text ps-1">Supervisores</span>
                    </div>
                  </a>
                  <ul className="nav collapse" id="user">
                    <li className="nav-item">
                      <Link className="nav-link" href="/pages/user/profile">
                        <div className="d-flex align-items-center">
                          <span className="nav-link-text ps-1">Perfil</span>
                        </div>
                      </Link>
                    </li>
                    <li className="nav-item">
                      <Link className="nav-link" href="/pages/user/settings">
                        <div className="d-flex align-items-center">
                          <span className="nav-link-text ps-1">Editar</span>
                        </div>
                      </Link>
                    </li>
                  </ul>
                  <Link
                    className="nav-link"
                    href="/app/support-desk/table-view"
                    role="button"
                  >
                    <div className="d-flex align-items-center">
                      <span className="nav-link-icon">
                        <span className="fas fa-thumbtack"></span>
                      </span>
                      <span className="nav-link-text ps-1">Supervisão</span>
                    </div>
                  </Link>
                  <Link
                    className="nav-link"
                    href="/app/support-desk/table-view"
                    role="button"
                  >
                    <div className="d-flex align-items-center">
                      <span className="nav-link-icon">
                        <span className="fas fa-thumbtack"></span>
                      </span>
                      <span className="nav-link-text ps-1">Ocorrências</span>
                    </div>
                  </Link>
                </li>
                {/* Add more nav items similarly */}
              </ul>
              <div className="settings my-3">
                <div className="card shadow-none">
                  <div className="card-body alert mb-0" role="alert">
                    <div className="btn-close-falcon-container">
                      <button
                        className="btn btn-link btn-close-falcon p-0"
                        aria-label="Close"
                        data-bs-dismiss="alert"
                      ></button>
                    </div>
                    <div className="text-center">
                      <Image
                        src="/assets/img/icons/spot-illustrations/navbar-vertical.png"
                        alt=""
                        width={80}
                        height={80}
                      />
                      <p className="fs-11 mt-2">
                        Precisa de Ajuda? <br /> Entre em contato com o suporte do{" "}
                        <a href="#!">Probvision</a>
                      </p>
                      <div className="d-grid">
                        <a className="btn btn-sm btn-primary" href="">
                          Support
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </nav>
        <div className="content">
          {/* Rest of the content, applying similar changes */}
          <nav className="navbar navbar-light navbar-glass navbar-top navbar-expand">
            <button
              className="btn navbar-toggler-humburger-icon navbar-toggler me-1 me-sm-3"
              type="button"
              data-bs-toggle="collapse"
              data-bs-target="#navbarVerticalCollapse"
              aria-controls="navbarVerticalCollapse"
              aria-expanded="false"
              aria-label="Toggle Navigation"
            >
              <span className="navbar-toggle-icon">
                <span className="toggle-line"></span>
              </span>
            </button>
            <Link className="navbar-brand me-1 me-sm-3" href="/">
              <div className="d-flex align-items-center">
                <Image
                  src="/assets/img/icons/spot-illustrations/logo.png"
                  alt="Logo"
                  width={40}
                  height={40}
                  priority
                />
              </div>
            </Link>
            {/* Continue converting other elements */}
          </nav>
          {/* Add other sections with className, Link, and Image */}
        </div>
      </div>
    </main>
  );
};

export default Dashboard;
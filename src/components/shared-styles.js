/**
@license
Copyright (c) 2018 The Polymer Project Authors. All rights reserved.
This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
Code distributed by Google as part of the polymer project is also
subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
*/

import { css } from 'lit-element';

export const SharedStyles = css`
:host {
    display: block;
    box-sizing: border-box;
  }

  section {
    padding: 24px;
    background: var(--app-section-odd-color);
  }

  section > * {
    max-width: 600px;
    margin-right: auto;
    margin-left: auto;
  }

  section:nth-of-type(even) {
    background: var(--app-section-even-color);
  }

  h2 {
    font-size: 24px;
    text-align: center;
    color: var(--app-dark-text-color);
  }

  @media (min-width: 460px) {
    h2 {
      font-size: 36px;
    }
  }

  .circle {
    display: block;
    width: 64px;
    height: 64px;
    margin: 0 auto;
    text-align: center;
    border-radius: 50%;
    background: var(--app-primary-color);
    color: var(--app-light-text-color);
    font-size: 30px;
    line-height: 64px;
  }
  
  .card-content #employee-image img {
    max-width: 60%;
  }

  .card-content > * {
    display: inline-block;
  }

  .employee-data {
    max-width: 50%;
  }

  .employee-data #employee-name {
    font-size: 18px;
    color: black;
  }

  .employee-data #employee-position {
    font-size: 12px;
    color: gray;
  }
  
  paper-button {
    font-size: 13px;
    border-style: solid;
    border-width: 0.6px;
    border-color: #ada593;
  }

  paper-button.toggle.active {
    font-weight: bold;
    background: repeating-linear-gradient(
      45deg,
      #4FC8ED,
      #4FC8ED 10px,
      #2a96b8 10px,
      #2a96b8 20px
    );
    color: white;
    border-style: none;
  }

  paper-button.submit_btn {
    font-weight: bold;
    color: white;
    background-color: #FF675C;
    border-style: none;
  }

  .btn-group > .active {
    color: white !important;
    font-weight: bold;
  }

  #pto-btn.active{
    background-color: #00CFB5;
  }

  #vacations-btn.active {
    background-color: #FFDD30;
  }

  .btn-primary {
    border-color: #FF675C;
    background-color: #FF675C;
  }
  
  h1,h5 {
    font-family: 'ITC Avant Garde Gothic Bold';
    color: #d7d6d5;
  }

  h2,h3,h6 {
    font-family: 'ITC Avant Garde Gothic';
    color: #6c757d;
  }

  .btn-light:not(:disabled):not(.disabled).active:focus {
    box-shadow: none;
  }

  .non-selectable {
    -moz-user-select: none; /* Firefox */
    -ms-user-select: none; /* Internet Explorer */
    -khtml-user-select: none; /* KHTML browsers (e.g. Konqueror) */
    -webkit-user-select: none; /* Chrome, Safari, and Opera */
    -webkit-touch-callout: none; /* Disable Android and iOS callouts*/
  }
`;

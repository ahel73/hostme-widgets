import Vue from "vue";

import template from "./contact-block.html";



Vue.component("contact-block", {
    template: template,
    props: [
        "customerName",
        "email",
        "phoneNumber",
    ]
});
import Vue from "vue";

import template from "./contact-block.html";



Vue.component("contact-block", {
    template: template,
    props: [
        "customer-name",
        "change-customer-name",
        "email",
        "change-email",
        "phone-number",
        "change-phone-number",
    ]
});
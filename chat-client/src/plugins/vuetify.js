import Vue from 'vue';
import Vuetify from 'vuetify/lib/framework';

Vue.use(Vuetify);

export default new Vuetify({
    theme: {
        dark: false,
        themes: {
            light: {
                primary: "#007aff",
                secondary: "#00a09d",
                info: "#252E48",
                background: "#beb2ff",
                lightBackground : "#dbd4ff"
            }
        }
    }
});
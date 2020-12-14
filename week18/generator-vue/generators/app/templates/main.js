import Vue from 'vue';
import Hello from './Hello.vue';

new Vue({
    el: '#app',
    render: c => c(Hello),
    components: { Hello }
})
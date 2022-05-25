
export default {
    components: {
        //'category_dropdown': () => import("./category_dropdown.vue.js"),
        'locationtree': () =>
            import("./locationtree.vue.js"),
        'autocomplete': () =>
            import("./autocomplete.vue.js"),
    },
    data() {
        return {
            loading: 0,
            error: false,
            message: "",
            searchCetegory: null,
            searchLocation: null,
            account: window.application.Account,
            TopNotificationBarItems: [],
            SearchByLocation: false,
        };
    },
    computed: {
        ...Vuex.mapState(['user', "device_type", "pages", "categories", "locations", "cart", "cart_cost_total"]),
    },
    watch: {
        user(newValue, oldValue) {
            if (!oldValue && newValue) {
                this.load_wishlist()
                this.$store.dispatch('load_cart')
            }
        },
        loading: function (newValue, oldValue) {
            if (newValue) {
                this.error = false
                this.message = false
                this.submitted = false
            }
        },
        pages: function (newValue, oldValue) {
            if (newValue) { }
        },
        $route(to, from) {
            this.$refs.navbartoggler.click()
        }
    },
    methods: {
        pages_from(from) {
            if (this.pages.length > from) {
                return this.pages.slice(from, from + 5);
            } else {
                return []
            }
        },
        checkout(event) {
            if (!this.cart || !this.cart.length) {
                return
            }
            if (!this.user) {
                this.submited = true
                this.$store.commit('set_showlogin', true)
            } else {
                this.$router.push("/checkout")
            }
        },
        load() {
            this.loading = true
            this.$store.dispatch('call', {
                api: "pages",
                data: {
                    sort: "weightage",
                    sortdesc: true,
                    limit: 20,
                }
            }).then((data) => {
                this.message = data.Message;
                if (data.Status == 2) {
                    this.error = false
                    if (Array.isArray(data.data)) {
                        this.$store.commit('set_pages', data.data)
                    }
                } else {
                    this.error = true
                }
            }).catch((error) => {
                console.error('Error:', error);
                this.error = true
                this.message = error
            }).finally(() => {
                this.loading = false
            })
        },
        load_locations() {
            this.loading = true
            this.$store.dispatch('call', {
                api: "locations",
                data: {
                    limit: 1200,
                }
            }).then((data) => {
                this.message = data.Message;
                if (data.Status == 2) {
                    this.error = false
                    this.$store.commit('set_locations', data.data)
                } else {
                    this.error = true
                }
            }).catch((error) => {
                console.error('Error:', error);
                this.error = true
                this.message = error
            }).finally(() => {
                this.loading = false
            })
        },
        load_wishlist() {
            if (!this.user) {
                return
            }
            this.$store.dispatch('call', {
                api: "wishlist",
                data: {}
            }).then((data) => {
                this.message = data.Message;
                if (data.Status == 2) {
                    this.error = false
                    if (Array.isArray(data.data)) {
                        this.$store.commit('add_to_wishlist', data.data)
                    }
                } else {
                    this.error = true
                }
            }).catch((error) => {
                console.error('Error:', error);
                this.error = true
                this.message = error
            })
        },
        init() {
            if (window.application.ThemeSettings) {
                if (window.application.ThemeSettings.TopNotificationBar) {
                    this.TopNotificationBarItems = window.application.ThemeSettings.TopNotificationBar.value
                }
            }
            debugger

            if (window.application.ThemeSettings) {
                if (window.application.ThemeSettings.SearchByLocation) {
                    this.SearchByLocation = window.application.ThemeSettings.SearchByLocation.value
                }
            }
        },
        toggle_navbar() {
            this.$refs.stuckMenu.classList.toggle('show');
        }
    },
    mounted: function () {
        this.init()
        this.load()
        if (this.user) {
            this.load_wishlist()
            this.$store.dispatch('load_cart')
        }
        var navbar = this.$refs.stickynavbar
        if (navbar != null) {
            var navbarClass = navbar.classList,
                navbarH = navbar.offsetHeight,
                scrollOffset = 500;
            window.addEventListener('scroll', function (e) {
                if (e.currentTarget.pageYOffset > scrollOffset) {
                    document.body.style.paddingTop = navbarH + 'px';
                    navbar.classList.add('navbar-stuck');
                } else {
                    document.body.style.paddingTop = '';
                    navbar.classList.remove('navbar-stuck');
                }
            });
        }
    },

        template: `
    <header class="bg-light shadow-sm fixed-top" data-fixed-element="">
        <div class="navbar navbar-expand-lg navbar-light">
            <div class="container-fluid">
                <a v-if="account.Logo" class="navbar-brand d-sm-none me-2" href="/">
                    <img :src="account.Logo" style="height: 50px;" :alt="account.Title">
                </a>
                <a v-if="account.WideLogo" class="navbar-brand d-none d-sm-block me-3 me-xl-4 flex-shrink-0" href="/">
                    <img :src="account.WideLogo" style="height: 60px;" :alt="account.Title">
                </a>
                <a v-else class="navbar-brand d-none d-sm-block flex-shrink-0 text-capitalize" href="/">{{ account.Title
                }}</a>

                <!-- Search-->
                <div class="input-group d-none d-lg-flex flex-nowrap mx-4">

                    <i class="ci-search position-absolute top-50 start-0 translate-middle-y ms-3"></i>
                    <autocomplete placeholder="Search for products" class="rounded-start w-100">
                    </autocomplete>

                    <div class="dropdown border">
                        <button class="btn  dropdown-toggle" type="button" id="dropdownMenuButton1"
                            data-bs-toggle="dropdown" aria-expanded="false">
                            Dropdown button
                        </button>
                        <ul class="dropdown-menu" aria-labelledby="dropdownMenuButton1">
                            <li v-for="category in categories" :key="'category' + category.ID">
                                <router-link class="dropdown-item" :to="'/shop/' + encodeURI(category.Name)">
                                    {{ category.Name }}
                                </router-link>
                            </li>
                        </ul>
                    </div>

                </div>

                <!-- Toolbar-->
                <div class="navbar-toolbar d-flex flex-shrink-0 align-items-center ms-xl-2">
                    <button class="navbar-toggler" type="button" data-bs-toggle="offcanvas"
                        data-bs-target="#sideNav"><span class="navbar-toggler-icon"></span></button><a
                        class="navbar-tool d-flex d-lg-none" href="#searchBox" data-bs-toggle="collapse" role="button"
                        aria-expanded="false" aria-controls="searchBox"><span class="navbar-tool-tooltip">Search</span>
                        <div class="navbar-tool-icon-box"><i class="navbar-tool-icon ci-search"></i></div>
                    </a>


                    <router-link class="navbar-tool d-none d-lg-flex" to="/user/wishlist">
                        <span class="navbar-tool-tooltip">Wishlist</span>
                        <div class="navbar-tool-icon-box">
                            <i class="navbar-tool-icon ci-heart"></i>
                        </div>
                    </router-link>

                    <router-link to="/user" v-if="user" class="navbar-tool ms-1 ms-lg-0 me-n1 me-lg-2">
                        <div class="navbar-tool-icon-box">
                            <i class="navbar-tool-icon ci-user"></i>
                        </div>
                        <div class="navbar-tool-text ms-n3">
                            <small>Hello, {{ user.Name }}</small>
                            My Account
                        </div>
                    </router-link>



                    <a v-else class="navbar-tool ms-1 ms-lg-0 me-n1 me-lg-2" href="#signin-modal"
                        @click.prevent="$store.commit('set_showlogin', true)">
                        <div class="navbar-tool-icon-box">
                            <i class="navbar-tool-icon ci-user"></i>
                        </div>
                        <div class="navbar-tool-text ms-n3">
                            <small>Sign in or</small>Sign up
                        </div>
                    </a>
                    <div class="navbar-tool dropdown ms-3">
                        <router-link to="/cart" class="navbar-tool-icon-box bg-secondary dropdown-toggle">
                            <span class="navbar-tool-label">{{ cart ? cart.length : '' }}</span>
                            <i class="navbar-tool-icon ci-cart"></i>
                        </router-link>
                        <router-link to="/cart" class="navbar-tool-text">
                            <small>My Cart</small><span>$</span>{{ cart_cost_total }}<span>.00</span>
                        </router-link>
                        <!-- Cart dropdown-->
                        <div class="dropdown-menu dropdown-menu-end">
                            <div class="widget widget-cart px-3 pt-2 pb-3" style="width: 20rem;">
                                <div style="height: 15rem; overflow-x: hidden;" data-simplebar
                                    data-simplebar-auto-hide="false">
                                    <div v-for="item in cart" class="widget-cart-item pb-2 border-bottom">
                                        <button class="btn-close text-danger" type="button" aria-label="Remove"
                                            @click.prevent="$store.dispatch('remove_from_cart', item)">
                                            <span aria-hidden="true">&times;</span>
                                        </button>
                                        <div class="d-flex align-items-center">
                                            <router-link :to="'/product/' + item.ProductID + '/' + encodeURI(item.Name)"
                                                class="flex-shrink-0">
                                                <img :src="item.Logo" width="64" alt="Product"
                                                    style="height: 70px; width: 70px;">
                                            </router-link>
                                            <div class="ps-2">
                                                <h6 class="widget-product-title">
                                                    <router-link
                                                        :to="'/product/' + item.ProductID + '/' + encodeURI(item.Name)">
                                                        {{ item.Name }}</router-link>
                                                </h6>
                                                <small>{{ getVariationName(item.Variation) }}
                                                    <span>({{ item.SKU }})</span></small>
                                                <div class="widget-product-meta">
                                                    <span class="text-accent me-2"><span>$</span>{{ item.Cost
                                                    }}<small>.00</small></span><span class="text-muted">x {{
        item.Quantity
}}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div class="d-flex flex-wrap justify-content-between align-items-center py-3">
                                    <div class="fs-sm me-2 py-2">
                                        <span class="text-muted">Subtotal:</span><span
                                            class="text-accent fs-base ms-1"><span>$</span>{{ cart_cost_total
                                            }}<small>.00</small></span>
                                    </div>
                                    <router-link to="/cart" class="btn btn-outline-secondary btn-sm">
                                        Expand cart
                                        <i class="ci-arrow-right ms-1 me-n1"></i>
                                    </router-link>
                                </div>
                                <button class="btn btn-primary btn-sm d-block w-100" @click.prevent="checkout">
                                    <i class="ci-card me-2 fs-base align-middle"></i>Checkout
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <!-- Search collapse-->
        <div class="collapse" id="searchBox">
            <div class="card pt-2 pb-4 border-0 rounded-0">
                <div class="container">
                    <div class="input-group">
                        <autocomplete placeholder="Search for products" class="d-lg-none my-3"></autocomplete>
                    </div>
                </div>
            </div>
        </div>
    </header>
`
}

const hostApi = process.env.NODE_ENV === "development" ? "http://localhost" : "https://www.thewhaddonshow.org";
const portApi = process.env.NODE_ENV === "development" ? 50001 : "";
const baseURLApi = `${hostApi}${portApi ? `:${portApi}` : ``}/api`;

const hostApp = process.env.NODE_ENV === "development" ? "https://localhost" : "https://www.thewhaddonshow.org";
const portApp = process.env.NODE_ENV === "development" ? 60001 : "";
const baseURLApp = `${hostApp}${portApp ? `:${portApp}` : ``}/app`;

const redirectUrl = process.env.NODE_ENV === "development" ? "https://localhost:60001" : "https://www.thewhaddonshow.org";

export default {
    redirectUrl,
    hostApi,
    portApi,
    baseURLApp,
    baseURLApi,
    remote: "https://www.thewhaddonshow.org",
  
    app: {
        sidebarColors: {
            first: '#3D3D3D',
            second: '#4B505F',
            third: '#483CB6',
            fourth: '#EFF2F5',
            fifth: '#20AE8C'
        },
        navbarColors: {
            first: '#ffffff',
            second: '#E2E7EC',
            third: '#C9D1FB',
            fourth: '#C1C3CF',
            fifth: '#0C2236',
            sixth: '#6FB0F9'
        },
        colors: {
            dark: "#002B49",
            light: "#FFFFFF",
            sea: "#004472",
            sky: "#E9EBEF",
            wave: "#D1E7F6",
            rain: "#CCDDE9",
            middle: "#D7DFE6",
            black: "#13191D",
            salad: "#21AE8C",
            seaWave: "#483CB6",
            grad: "#4B505F",
            blueSky: "#EFF2F5"
        },
        themeColors: {
            primary: "#6FB0F9",
            secondary: "#798892",
            success: "#26CD5F",
            info: "#10CFD0",
            warning: "#EBB834",
            danger: "#FF5574",
            inverse: "#30324C",
            default: "#9083F7"
        },
    }
};

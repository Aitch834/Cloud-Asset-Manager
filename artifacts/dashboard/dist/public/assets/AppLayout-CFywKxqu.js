import { s as createLucideIcon, m as useQuery, b as useAppStore, u as useLocation, r as reactExports, j as jsxRuntimeExports, l as cn, p as Link, M as MapPin, U as FlaskConical, B as Building2, K as Map, c as useQueryClient, a as useToast, S as useMutation, a7 as customFetch, X, a8 as Root, a9 as createDialogScope, aa as Portal, k as useComposedRefs, ab as WarningProvider, ac as Content, g as composeEventHandlers, ad as Title, ae as Description, af as Close, ag as Overlay, ah as createSlottable, i as createContextScope, ai as Trigger, aj as buttonVariants, ak as useGetMyTenants, d as Button, e as LoaderCircle, A as ArrowRight, al as useNavHistory } from "./index-CWg1uz92.js";
import { a as useSafeClerk, P as Package } from "./use-safe-clerk-yxeMAV4p.js";
import { C as ChevronDown, T as Trash2 } from "./trash-2-bNcDHRIZ.js";
import { D as Database, a as Clock, C as CircleAlert } from "./database-CCp5Ra3z.js";
import { F as FileText, P as PoundSterling, C as ClipboardCheck, S as ShieldAlert, D as Droplets, G as GraduationCap } from "./shield-alert-Dw4nlDq_.js";
import { L as Leaf, T as TriangleAlert } from "./triangle-alert-ChBFCAPt.js";
import { S as ShieldCheck } from "./shield-check-BD6UJ8iZ.js";
import { T as Tractor, C as ChevronRight, A as ArrowLeft } from "./tractor-Bpekk4J1.js";
const __iconNode$N = [
  ["path", { d: "M10.268 21a2 2 0 0 0 3.464 0", key: "vwvbt9" }],
  [
    "path",
    {
      d: "M3.262 15.326A1 1 0 0 0 4 17h16a1 1 0 0 0 .74-1.673C19.41 13.956 18 12.499 18 8A6 6 0 0 0 6 8c0 4.499-1.411 5.956-2.738 7.326",
      key: "11g9vi"
    }
  ]
];
const Bell = createLucideIcon("bell", __iconNode$N);
const __iconNode$M = [
  ["path", { d: "M16 7h.01", key: "1kdx03" }],
  ["path", { d: "M3.4 18H12a8 8 0 0 0 8-8V7a4 4 0 0 0-7.28-2.3L2 20", key: "oj1oa8" }],
  ["path", { d: "m20 7 2 .5-2 .5", key: "12nv4d" }],
  ["path", { d: "M10 18v3", key: "1yea0a" }],
  ["path", { d: "M14 17.75V21", key: "1pymcb" }],
  ["path", { d: "M7 18a6 6 0 0 0 3.84-10.61", key: "1npnn0" }]
];
const Bird = createLucideIcon("bird", __iconNode$M);
const __iconNode$L = [
  ["path", { d: "M12 7v14", key: "1akyts" }],
  [
    "path",
    {
      d: "M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z",
      key: "ruj8y"
    }
  ]
];
const BookOpen = createLucideIcon("book-open", __iconNode$L);
const __iconNode$K = [
  [
    "path",
    {
      d: "M2.97 12.92A2 2 0 0 0 2 14.63v3.24a2 2 0 0 0 .97 1.71l3 1.8a2 2 0 0 0 2.06 0L12 19v-5.5l-5-3-4.03 2.42Z",
      key: "lc1i9w"
    }
  ],
  ["path", { d: "m7 16.5-4.74-2.85", key: "1o9zyk" }],
  ["path", { d: "m7 16.5 5-3", key: "va8pkn" }],
  ["path", { d: "M7 16.5v5.17", key: "jnp8gn" }],
  [
    "path",
    {
      d: "M12 13.5V19l3.97 2.38a2 2 0 0 0 2.06 0l3-1.8a2 2 0 0 0 .97-1.71v-3.24a2 2 0 0 0-.97-1.71L17 10.5l-5 3Z",
      key: "8zsnat"
    }
  ],
  ["path", { d: "m17 16.5-5-3", key: "8arw3v" }],
  ["path", { d: "m17 16.5 4.74-2.85", key: "8rfmw" }],
  ["path", { d: "M17 16.5v5.17", key: "k6z78m" }],
  [
    "path",
    {
      d: "M7.97 4.42A2 2 0 0 0 7 6.13v4.37l5 3 5-3V6.13a2 2 0 0 0-.97-1.71l-3-1.8a2 2 0 0 0-2.06 0l-3 1.8Z",
      key: "1xygjf"
    }
  ],
  ["path", { d: "M12 8 7.26 5.15", key: "1vbdud" }],
  ["path", { d: "m12 8 4.74-2.85", key: "3rx089" }],
  ["path", { d: "M12 13.5V8", key: "1io7kd" }]
];
const Boxes = createLucideIcon("boxes", __iconNode$K);
const __iconNode$J = [
  ["path", { d: "M12 20v-9", key: "1qisl0" }],
  ["path", { d: "M14 7a4 4 0 0 1 4 4v3a6 6 0 0 1-12 0v-3a4 4 0 0 1 4-4z", key: "uouzyp" }],
  ["path", { d: "M14.12 3.88 16 2", key: "qol33r" }],
  ["path", { d: "M21 21a4 4 0 0 0-3.81-4", key: "1b0z45" }],
  ["path", { d: "M21 5a4 4 0 0 1-3.55 3.97", key: "5cxbf6" }],
  ["path", { d: "M22 13h-4", key: "1jl80f" }],
  ["path", { d: "M3 21a4 4 0 0 1 3.81-4", key: "1fjd4g" }],
  ["path", { d: "M3 5a4 4 0 0 0 3.55 3.97", key: "1d7oge" }],
  ["path", { d: "M6 13H2", key: "82j7cp" }],
  ["path", { d: "m8 2 1.88 1.88", key: "fmnt4t" }],
  ["path", { d: "M9 7.13V6a3 3 0 1 1 6 0v1.13", key: "1vgav8" }]
];
const Bug = createLucideIcon("bug", __iconNode$J);
const __iconNode$I = [
  ["path", { d: "M16 14v2.2l1.6 1", key: "fo4ql5" }],
  ["path", { d: "M16 2v4", key: "4m81vk" }],
  ["path", { d: "M21 7.5V6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h3.5", key: "1osxxc" }],
  ["path", { d: "M3 10h5", key: "r794hk" }],
  ["path", { d: "M8 2v4", key: "1cmpym" }],
  ["circle", { cx: "16", cy: "16", r: "6", key: "qoo3c4" }]
];
const CalendarClock = createLucideIcon("calendar-clock", __iconNode$I);
const __iconNode$H = [
  ["path", { d: "M8 2v4", key: "1cmpym" }],
  ["path", { d: "M16 2v4", key: "4m81vk" }],
  ["rect", { width: "18", height: "18", x: "3", y: "4", rx: "2", key: "1hopcy" }],
  ["path", { d: "M3 10h18", key: "8toen8" }],
  ["path", { d: "M8 14h.01", key: "6423bh" }],
  ["path", { d: "M12 14h.01", key: "1etili" }],
  ["path", { d: "M16 14h.01", key: "1gbofw" }],
  ["path", { d: "M8 18h.01", key: "lrp35t" }],
  ["path", { d: "M12 18h.01", key: "mhygvu" }],
  ["path", { d: "M16 18h.01", key: "kzsmim" }]
];
const CalendarDays = createLucideIcon("calendar-days", __iconNode$H);
const __iconNode$G = [
  ["path", { d: "M3 3v16a2 2 0 0 0 2 2h16", key: "c24i48" }],
  ["path", { d: "M18 17V9", key: "2bz60n" }],
  ["path", { d: "M13 17V5", key: "1frdt8" }],
  ["path", { d: "M8 17v-3", key: "17ska0" }]
];
const ChartColumn = createLucideIcon("chart-column", __iconNode$G);
const __iconNode$F = [
  ["path", { d: "M18 6 7 17l-5-5", key: "116fxf" }],
  ["path", { d: "m22 10-7.5 7.5L13 16", key: "ke71qq" }]
];
const CheckCheck = createLucideIcon("check-check", __iconNode$F);
const __iconNode$E = [
  ["circle", { cx: "12", cy: "12", r: "10", key: "1mglay" }],
  ["path", { d: "M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3", key: "1u773s" }],
  ["path", { d: "M12 17h.01", key: "p32p05" }]
];
const CircleQuestionMark = createLucideIcon("circle-question-mark", __iconNode$E);
const __iconNode$D = [
  ["rect", { width: "8", height: "4", x: "8", y: "2", rx: "1", ry: "1", key: "tgr4d6" }],
  [
    "path",
    {
      d: "M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2",
      key: "116196"
    }
  ],
  ["path", { d: "M12 11h4", key: "1jrz19" }],
  ["path", { d: "M12 16h4", key: "n85exb" }],
  ["path", { d: "M8 11h.01", key: "1dfujw" }],
  ["path", { d: "M8 16h.01", key: "18s6g9" }]
];
const ClipboardList = createLucideIcon("clipboard-list", __iconNode$D);
const __iconNode$C = [
  ["path", { d: "M12 2v2", key: "tus03m" }],
  ["path", { d: "m4.93 4.93 1.41 1.41", key: "149t6j" }],
  ["path", { d: "M20 12h2", key: "1q8mjw" }],
  ["path", { d: "m19.07 4.93-1.41 1.41", key: "1shlcs" }],
  ["path", { d: "M15.947 12.65a4 4 0 0 0-5.925-4.128", key: "dpwdj0" }],
  ["path", { d: "M13 22H7a5 5 0 1 1 4.9-6H13a3 3 0 0 1 0 6Z", key: "s09mg5" }]
];
const CloudSun = createLucideIcon("cloud-sun", __iconNode$C);
const __iconNode$B = [
  ["circle", { cx: "12", cy: "12", r: "10", key: "1mglay" }],
  ["line", { x1: "22", x2: "18", y1: "12", y2: "12", key: "l9bcsi" }],
  ["line", { x1: "6", x2: "2", y1: "12", y2: "12", key: "13hhkx" }],
  ["line", { x1: "12", x2: "12", y1: "6", y2: "2", key: "10w3f3" }],
  ["line", { x1: "12", x2: "12", y1: "22", y2: "18", key: "15g9kq" }]
];
const Crosshair = createLucideIcon("crosshair", __iconNode$B);
const __iconNode$A = [
  ["path", { d: "M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z", key: "1rqfz7" }],
  ["path", { d: "M14 2v4a2 2 0 0 0 2 2h4", key: "tnqrlb" }],
  ["path", { d: "M8 18v-1", key: "zg0ygc" }],
  ["path", { d: "M12 18v-6", key: "17g6i2" }],
  ["path", { d: "M16 18v-3", key: "j5jt4h" }]
];
const FileChartColumn = createLucideIcon("file-chart-column", __iconNode$A);
const __iconNode$z = [
  [
    "path",
    {
      d: "M12 3q1 4 4 6.5t3 5.5a1 1 0 0 1-14 0 5 5 0 0 1 1-3 1 1 0 0 0 5 0c0-2-1.5-3-1.5-5q0-2 2.5-4",
      key: "1slcih"
    }
  ]
];
const Flame = createLucideIcon("flame", __iconNode$z);
const __iconNode$y = [
  [
    "path",
    { d: "M14 13h2a2 2 0 0 1 2 2v2a2 2 0 0 0 4 0v-6.998a2 2 0 0 0-.59-1.42L18 5", key: "1wtuz0" }
  ],
  ["path", { d: "M14 21V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v16", key: "e09ifn" }],
  ["path", { d: "M2 21h13", key: "1x0fut" }],
  ["path", { d: "M3 9h11", key: "1p7c0w" }]
];
const Fuel = createLucideIcon("fuel", __iconNode$y);
const __iconNode$x = [
  ["path", { d: "m12 14 4-4", key: "9kzdfg" }],
  ["path", { d: "M3.34 19a10 10 0 1 1 17.32 0", key: "19p75a" }]
];
const Gauge = createLucideIcon("gauge", __iconNode$x);
const __iconNode$w = [
  ["path", { d: "M22 5V2l-5.89 5.89", key: "1eenpo" }],
  ["circle", { cx: "16.6", cy: "15.89", r: "3", key: "xjtalx" }],
  ["circle", { cx: "8.11", cy: "7.4", r: "3", key: "u2fv6i" }],
  ["circle", { cx: "12.35", cy: "11.65", r: "3", key: "i6i8g7" }],
  ["circle", { cx: "13.91", cy: "5.85", r: "3", key: "6ye0dv" }],
  ["circle", { cx: "18.15", cy: "10.09", r: "3", key: "snx9no" }],
  ["circle", { cx: "6.56", cy: "13.2", r: "3", key: "17x4xg" }],
  ["circle", { cx: "10.8", cy: "17.44", r: "3", key: "1hogw9" }],
  ["circle", { cx: "5", cy: "19", r: "3", key: "1sn6vo" }]
];
const Grape = createLucideIcon("grape", __iconNode$w);
const __iconNode$v = [
  [
    "path",
    {
      d: "M2 9.5a5.5 5.5 0 0 1 9.591-3.676.56.56 0 0 0 .818 0A5.49 5.49 0 0 1 22 9.5c0 2.29-1.5 4-3 5.5l-5.492 5.313a2 2 0 0 1-3 .019L5 15c-1.5-1.5-3-3.2-3-5.5",
      key: "mvr1a0"
    }
  ],
  ["path", { d: "M3.22 13H9.5l.5-1 2 4.5 2-7 1.5 3.5h5.27", key: "auskq0" }]
];
const HeartPulse = createLucideIcon("heart-pulse", __iconNode$v);
const __iconNode$u = [
  ["circle", { cx: "12", cy: "12", r: "10", key: "1mglay" }],
  ["path", { d: "M12 16v-4", key: "1dtifu" }],
  ["path", { d: "M12 8h.01", key: "e9boi3" }]
];
const Info = createLucideIcon("info", __iconNode$u);
const __iconNode$t = [
  ["path", { d: "M10 18v-7", key: "wt116b" }],
  [
    "path",
    {
      d: "M11.12 2.198a2 2 0 0 1 1.76.006l7.866 3.847c.476.233.31.949-.22.949H3.474c-.53 0-.695-.716-.22-.949z",
      key: "1m329m"
    }
  ],
  ["path", { d: "M14 18v-7", key: "vav6t3" }],
  ["path", { d: "M18 18v-7", key: "aexdmj" }],
  ["path", { d: "M3 22h18", key: "8prr45" }],
  ["path", { d: "M6 18v-7", key: "1ivflk" }]
];
const Landmark = createLucideIcon("landmark", __iconNode$t);
const __iconNode$s = [
  ["rect", { width: "7", height: "9", x: "3", y: "3", rx: "1", key: "10lvy0" }],
  ["rect", { width: "7", height: "5", x: "14", y: "3", rx: "1", key: "16une8" }],
  ["rect", { width: "7", height: "9", x: "14", y: "12", rx: "1", key: "1hutg5" }],
  ["rect", { width: "7", height: "5", x: "3", y: "16", rx: "1", key: "ldoo1y" }]
];
const LayoutDashboard = createLucideIcon("layout-dashboard", __iconNode$s);
const __iconNode$r = [
  [
    "path",
    {
      d: "M12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83z",
      key: "zw3jo"
    }
  ],
  [
    "path",
    {
      d: "M2 12a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 12",
      key: "1wduqc"
    }
  ],
  [
    "path",
    {
      d: "M2 17a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 17",
      key: "kqbvx6"
    }
  ]
];
const Layers = createLucideIcon("layers", __iconNode$r);
const __iconNode$q = [
  ["circle", { cx: "12", cy: "12", r: "10", key: "1mglay" }],
  ["path", { d: "m4.93 4.93 4.24 4.24", key: "1ymg45" }],
  ["path", { d: "m14.83 9.17 4.24-4.24", key: "1cb5xl" }],
  ["path", { d: "m14.83 14.83 4.24 4.24", key: "q42g0n" }],
  ["path", { d: "m9.17 14.83-4.24 4.24", key: "bqpfvv" }],
  ["circle", { cx: "12", cy: "12", r: "4", key: "4exip2" }]
];
const LifeBuoy = createLucideIcon("life-buoy", __iconNode$q);
const __iconNode$p = [
  ["path", { d: "M3 5h.01", key: "18ugdj" }],
  ["path", { d: "M3 12h.01", key: "nlz23k" }],
  ["path", { d: "M3 19h.01", key: "noohij" }],
  ["path", { d: "M8 5h13", key: "1pao27" }],
  ["path", { d: "M8 12h13", key: "1za7za" }],
  ["path", { d: "M8 19h13", key: "m83p4d" }]
];
const List = createLucideIcon("list", __iconNode$p);
const __iconNode$o = [
  ["path", { d: "m16 17 5-5-5-5", key: "1bji2h" }],
  ["path", { d: "M21 12H9", key: "dn1m92" }],
  ["path", { d: "M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4", key: "1uf3rs" }]
];
const LogOut = createLucideIcon("log-out", __iconNode$o);
const __iconNode$n = [
  ["path", { d: "M4 5h16", key: "1tepv9" }],
  ["path", { d: "M4 12h16", key: "1lakjw" }],
  ["path", { d: "M4 19h16", key: "1djgab" }]
];
const Menu = createLucideIcon("menu", __iconNode$n);
const __iconNode$m = [
  ["path", { d: "M8 2h8", key: "1ssgc1" }],
  [
    "path",
    {
      d: "M9 2v2.789a4 4 0 0 1-.672 2.219l-.656.984A4 4 0 0 0 7 10.212V20a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2v-9.789a4 4 0 0 0-.672-2.219l-.656-.984A4 4 0 0 1 15 4.788V2",
      key: "qtp12x"
    }
  ],
  ["path", { d: "M7 15a6.472 6.472 0 0 1 5 0 6.47 6.47 0 0 0 5 0", key: "ygeh44" }]
];
const Milk = createLucideIcon("milk", __iconNode$m);
const __iconNode$l = [
  ["polygon", { points: "3 11 22 2 13 21 11 13 3 11", key: "1ltx0t" }]
];
const Navigation = createLucideIcon("navigation", __iconNode$l);
const __iconNode$k = [
  [
    "path",
    {
      d: "M11 17h3v2a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1v-3a3.16 3.16 0 0 0 2-2h1a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1h-1a5 5 0 0 0-2-4V3a4 4 0 0 0-3.2 1.6l-.3.4H11a6 6 0 0 0-6 6v1a5 5 0 0 0 2 4v3a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1z",
      key: "1piglc"
    }
  ],
  ["path", { d: "M16 10h.01", key: "1m94wz" }],
  ["path", { d: "M2 8v1a2 2 0 0 0 2 2h1", key: "1env43" }]
];
const PiggyBank = createLucideIcon("piggy-bank", __iconNode$k);
const __iconNode$j = [
  [
    "path",
    {
      d: "M7 19H4.815a1.83 1.83 0 0 1-1.57-.881 1.785 1.785 0 0 1-.004-1.784L7.196 9.5",
      key: "x6z5xu"
    }
  ],
  [
    "path",
    {
      d: "M11 19h8.203a1.83 1.83 0 0 0 1.556-.89 1.784 1.784 0 0 0 0-1.775l-1.226-2.12",
      key: "1x4zh5"
    }
  ],
  ["path", { d: "m14 16-3 3 3 3", key: "f6jyew" }],
  ["path", { d: "M8.293 13.596 7.196 9.5 3.1 10.598", key: "wf1obh" }],
  [
    "path",
    {
      d: "m9.344 5.811 1.093-1.892A1.83 1.83 0 0 1 11.985 3a1.784 1.784 0 0 1 1.546.888l3.943 6.843",
      key: "9tzpgr"
    }
  ],
  ["path", { d: "m13.378 9.633 4.096 1.098 1.097-4.096", key: "1oe83g" }]
];
const Recycle = createLucideIcon("recycle", __iconNode$j);
const __iconNode$i = [
  ["path", { d: "M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8", key: "1357e3" }],
  ["path", { d: "M3 3v5h5", key: "1xhq8a" }]
];
const RotateCcw = createLucideIcon("rotate-ccw", __iconNode$i);
const __iconNode$h = [
  ["path", { d: "m16 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z", key: "7g6ntu" }],
  ["path", { d: "m2 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z", key: "ijws7r" }],
  ["path", { d: "M7 21h10", key: "1b0cd5" }],
  ["path", { d: "M12 3v18", key: "108xh3" }],
  ["path", { d: "M3 7h2c2 0 5-1 7-2 2 1 5 2 7 2h2", key: "3gwbw2" }]
];
const Scale = createLucideIcon("scale", __iconNode$h);
const __iconNode$g = [
  ["circle", { cx: "6", cy: "6", r: "3", key: "1lh9wr" }],
  ["path", { d: "M8.12 8.12 12 12", key: "1alkpv" }],
  ["path", { d: "M20 4 8.12 15.88", key: "xgtan2" }],
  ["circle", { cx: "6", cy: "18", r: "3", key: "fqmcym" }],
  ["path", { d: "M14.8 14.8 20 20", key: "ptml3r" }]
];
const Scissors = createLucideIcon("scissors", __iconNode$g);
const __iconNode$f = [
  [
    "path",
    {
      d: "M9.671 4.136a2.34 2.34 0 0 1 4.659 0 2.34 2.34 0 0 0 3.319 1.915 2.34 2.34 0 0 1 2.33 4.033 2.34 2.34 0 0 0 0 3.831 2.34 2.34 0 0 1-2.33 4.033 2.34 2.34 0 0 0-3.319 1.915 2.34 2.34 0 0 1-4.659 0 2.34 2.34 0 0 0-3.32-1.915 2.34 2.34 0 0 1-2.33-4.033 2.34 2.34 0 0 0 0-3.831A2.34 2.34 0 0 1 6.35 6.051a2.34 2.34 0 0 0 3.319-1.915",
      key: "1i5ecw"
    }
  ],
  ["circle", { cx: "12", cy: "12", r: "3", key: "1v7zrd" }]
];
const Settings = createLucideIcon("settings", __iconNode$f);
const __iconNode$e = [
  ["path", { d: "M16 10a4 4 0 0 1-8 0", key: "1ltviw" }],
  ["path", { d: "M3.103 6.034h17.794", key: "awc11p" }],
  [
    "path",
    {
      d: "M3.4 5.467a2 2 0 0 0-.4 1.2V20a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6.667a2 2 0 0 0-.4-1.2l-2-2.667A2 2 0 0 0 17 2H7a2 2 0 0 0-1.6.8z",
      key: "o988cm"
    }
  ]
];
const ShoppingBag = createLucideIcon("shopping-bag", __iconNode$e);
const __iconNode$d = [
  [
    "path",
    {
      d: "M21.56 4.56a1.5 1.5 0 0 1 0 2.122l-.47.47a3 3 0 0 1-4.212-.03 3 3 0 0 1 0-4.243l.44-.44a1.5 1.5 0 0 1 2.121 0z",
      key: "1gcedi"
    }
  ],
  [
    "path",
    {
      d: "M3 22a1 1 0 0 1-1-1v-3.586a1 1 0 0 1 .293-.707l3.355-3.355a1.205 1.205 0 0 1 1.704 0l3.296 3.296a1.205 1.205 0 0 1 0 1.704l-3.355 3.355a1 1 0 0 1-.707.293z",
      key: "pg9kv3"
    }
  ],
  ["path", { d: "m9 15 7.879-7.878", key: "1o1zgh" }]
];
const Shovel = createLucideIcon("shovel", __iconNode$d);
const __iconNode$c = [
  ["rect", { width: "14", height: "20", x: "5", y: "2", rx: "2", ry: "2", key: "1yt0o3" }],
  ["path", { d: "M12 18h.01", key: "mhygvu" }]
];
const Smartphone = createLucideIcon("smartphone", __iconNode$c);
const __iconNode$b = [
  [
    "path",
    {
      d: "M14 9.536V7a4 4 0 0 1 4-4h1.5a.5.5 0 0 1 .5.5V5a4 4 0 0 1-4 4 4 4 0 0 0-4 4c0 2 1 3 1 5a5 5 0 0 1-1 3",
      key: "139s4v"
    }
  ],
  ["path", { d: "M4 9a5 5 0 0 1 8 4 5 5 0 0 1-8-4", key: "1dlkgp" }],
  ["path", { d: "M5 21h14", key: "11awu3" }]
];
const Sprout = createLucideIcon("sprout", __iconNode$b);
const __iconNode$a = [
  ["path", { d: "M11 2v2", key: "1539x4" }],
  ["path", { d: "M5 2v2", key: "1yf1q8" }],
  ["path", { d: "M5 3H4a2 2 0 0 0-2 2v4a6 6 0 0 0 12 0V5a2 2 0 0 0-2-2h-1", key: "rb5t3r" }],
  ["path", { d: "M8 15a6 6 0 0 0 12 0v-3", key: "x18d4x" }],
  ["circle", { cx: "20", cy: "10", r: "2", key: "ts1r5v" }]
];
const Stethoscope = createLucideIcon("stethoscope", __iconNode$a);
const __iconNode$9 = [
  ["path", { d: "M14.5 2v17.5c0 1.4-1.1 2.5-2.5 2.5c-1.4 0-2.5-1.1-2.5-2.5V2", key: "125lnx" }],
  ["path", { d: "M8.5 2h7", key: "csnxdl" }],
  ["path", { d: "M14.5 16h-5", key: "1ox875" }]
];
const TestTube = createLucideIcon("test-tube", __iconNode$9);
const __iconNode$8 = [
  [
    "path",
    {
      d: "m17 14 3 3.3a1 1 0 0 1-.7 1.7H4.7a1 1 0 0 1-.7-1.7L7 14h-.3a1 1 0 0 1-.7-1.7L9 9h-.2A1 1 0 0 1 8 7.3L12 3l4 4.3a1 1 0 0 1-.8 1.7H15l3 3.3a1 1 0 0 1-.7 1.7H17Z",
      key: "cpyugq"
    }
  ],
  ["path", { d: "M12 22v-3", key: "kmzjlo" }]
];
const TreePine = createLucideIcon("tree-pine", __iconNode$8);
const __iconNode$7 = [
  ["path", { d: "M16 7h6v6", key: "box55l" }],
  ["path", { d: "m22 7-8.5 8.5-5-5L2 17", key: "1t1m79" }]
];
const TrendingUp = createLucideIcon("trending-up", __iconNode$7);
const __iconNode$6 = [
  ["path", { d: "M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2", key: "wrbu53" }],
  ["path", { d: "M15 18H9", key: "1lyqi6" }],
  [
    "path",
    {
      d: "M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14",
      key: "lysw3i"
    }
  ],
  ["circle", { cx: "17", cy: "18", r: "2", key: "332jqn" }],
  ["circle", { cx: "7", cy: "18", r: "2", key: "19iecd" }]
];
const Truck = createLucideIcon("truck", __iconNode$6);
const __iconNode$5 = [
  ["path", { d: "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2", key: "1yyitq" }],
  ["path", { d: "M16 3.128a4 4 0 0 1 0 7.744", key: "16gr8j" }],
  ["path", { d: "M22 21v-2a4 4 0 0 0-3-3.87", key: "kshegd" }],
  ["circle", { cx: "9", cy: "7", r: "4", key: "nufk8" }]
];
const Users = createLucideIcon("users", __iconNode$5);
const __iconNode$4 = [
  ["path", { d: "M18 21V10a1 1 0 0 0-1-1H7a1 1 0 0 0-1 1v11", key: "pb2vm6" }],
  [
    "path",
    {
      d: "M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8a2 2 0 0 1 1.132-1.803l7.95-3.974a2 2 0 0 1 1.837 0l7.948 3.974A2 2 0 0 1 22 8z",
      key: "doq5xv"
    }
  ],
  ["path", { d: "M6 13h12", key: "yf64js" }],
  ["path", { d: "M6 17h12", key: "1jwigz" }]
];
const Warehouse = createLucideIcon("warehouse", __iconNode$4);
const __iconNode$3 = [
  [
    "path",
    {
      d: "M2 6c.6.5 1.2 1 2.5 1C7 7 7 5 9.5 5c2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1",
      key: "knzxuh"
    }
  ],
  [
    "path",
    {
      d: "M2 12c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1",
      key: "2jd2cc"
    }
  ],
  [
    "path",
    {
      d: "M2 18c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1",
      key: "rd2r6e"
    }
  ]
];
const Waves = createLucideIcon("waves", __iconNode$3);
const __iconNode$2 = [
  ["path", { d: "M2 22 16 8", key: "60hf96" }],
  [
    "path",
    {
      d: "M3.47 12.53 5 11l1.53 1.53a3.5 3.5 0 0 1 0 4.94L5 19l-1.53-1.53a3.5 3.5 0 0 1 0-4.94Z",
      key: "1rdhi6"
    }
  ],
  [
    "path",
    {
      d: "M7.47 8.53 9 7l1.53 1.53a3.5 3.5 0 0 1 0 4.94L9 15l-1.53-1.53a3.5 3.5 0 0 1 0-4.94Z",
      key: "1sdzmb"
    }
  ],
  [
    "path",
    {
      d: "M11.47 4.53 13 3l1.53 1.53a3.5 3.5 0 0 1 0 4.94L13 11l-1.53-1.53a3.5 3.5 0 0 1 0-4.94Z",
      key: "eoatbi"
    }
  ],
  ["path", { d: "M20 2h2v2a4 4 0 0 1-4 4h-2V6a4 4 0 0 1 4-4Z", key: "19rau1" }],
  [
    "path",
    {
      d: "M11.47 17.47 13 19l-1.53 1.53a3.5 3.5 0 0 1-4.94 0L5 19l1.53-1.53a3.5 3.5 0 0 1 4.94 0Z",
      key: "tc8ph9"
    }
  ],
  [
    "path",
    {
      d: "M15.47 13.47 17 15l-1.53 1.53a3.5 3.5 0 0 1-4.94 0L9 15l1.53-1.53a3.5 3.5 0 0 1 4.94 0Z",
      key: "2m8kc5"
    }
  ],
  [
    "path",
    {
      d: "M19.47 9.47 21 11l-1.53 1.53a3.5 3.5 0 0 1-4.94 0L13 11l1.53-1.53a3.5 3.5 0 0 1 4.94 0Z",
      key: "vex3ng"
    }
  ]
];
const Wheat = createLucideIcon("wheat", __iconNode$2);
const __iconNode$1 = [
  [
    "path",
    {
      d: "M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.106-3.105c.32-.322.863-.22.983.218a6 6 0 0 1-8.259 7.057l-7.91 7.91a1 1 0 0 1-2.999-3l7.91-7.91a6 6 0 0 1 7.057-8.259c.438.12.54.662.219.984z",
      key: "1ngwbx"
    }
  ]
];
const Wrench = createLucideIcon("wrench", __iconNode$1);
const __iconNode = [
  [
    "path",
    {
      d: "M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z",
      key: "1xq2db"
    }
  ]
];
const Zap = createLucideIcon("zap", __iconNode);
const APP_VERSION = "1.4.17";
const APP_BUILD = 1245;
const APP_VERSION_FULL = `${APP_VERSION} Build ${APP_BUILD}`;
function useAppVersion() {
  const { data } = useQuery({
    queryKey: ["app-version"],
    queryFn: () => fetch("/api/version").then((r) => r.json()),
    staleTime: 5 * 60 * 1e3,
    gcTime: 30 * 60 * 1e3
  });
  return data?.full ?? APP_VERSION_FULL;
}
const ROLE_RANK$1 = {
  operator: 0,
  senior: 1,
  manager: 2,
  owner: 3
};
function authHeaders() {
  return {};
}
function useUserRole() {
  const { farmId } = useAppStore();
  const { data } = useQuery({
    queryKey: ["my-access", farmId],
    queryFn: async () => {
      const res = await fetch(`/api/farms/${farmId}/my-access`, { headers: authHeaders() });
      if (!res.ok) return { farmRole: "owner", accessType: "full" };
      return res.json();
    },
    enabled: !!farmId,
    staleTime: 5 * 60 * 1e3
  });
  const role = data?.farmRole ?? "owner";
  const accessType = data?.accessType ?? "full";
  const displayName = data?.displayName ?? null;
  return {
    role,
    accessType,
    displayName,
    isAtLeast: (min) => ROLE_RANK$1[role] >= ROLE_RANK$1[min]
  };
}
const coreNav = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Group Overview", href: "/group-overview", icon: Building2 },
  { name: "Week Ahead", href: "/week-ahead", icon: CalendarDays },
  { name: "Task Board", href: "/task-board", icon: ClipboardList },
  { name: "Resource Planner", href: "/resources", icon: CalendarClock, moduleKeys: ["resource-planner"] },
  { name: "Resource Map", href: "/resource-map", icon: Navigation },
  { name: "Weather", href: "/weather", icon: CloudSun, moduleKeys: ["weather-tracking"] }
];
const peopleNav = [
  { name: "Staff", href: "/staff", icon: Users },
  { name: "Departments", href: "/departments", icon: Building2 },
  { name: "Labour", href: "/labour", icon: Clock, moduleKeys: ["staff-training"] },
  { name: "Training", href: "/training", icon: GraduationCap, moduleKeys: ["staff-training"] }
];
const farmManagementNav = [
  { name: "Fields & Crops", href: "/fields", icon: Sprout, moduleKeys: ["field-crop-management", "viticulture", "fresh-produce", "organic-compliance", "organic-fresh-produce", "organic-arable", "biofuel-rtfo"] },
  { name: "Harvest Records", href: "/harvest", icon: Wheat, moduleKeys: ["field-crop-management", "viticulture", "fresh-produce", "organic-arable"] },
  { name: "Field Operations", href: "/field-operations", icon: Shovel, moduleKeys: ["field-crop-management", "viticulture", "fresh-produce", "organic-arable"] },
  { name: "Field Inspections", href: "/field-inspections", icon: ClipboardCheck, moduleKeys: ["field-crop-management", "viticulture", "fresh-produce", "organic-arable"] },
  { name: "Storage Locations", href: "/storage-locations", icon: Warehouse, moduleKeys: ["field-crop-management", "fresh-produce", "organic-arable"] },
  { name: "Crop Stock", href: "/crop-stock", icon: Layers, moduleKeys: ["field-crop-management", "fresh-produce", "organic-arable"] },
  { name: "Seed Store", href: "/seed-store", icon: Package, moduleKeys: ["field-crop-management", "fresh-produce", "organic-arable"] },
  { name: "Straw Management", href: "/straw-management", icon: Wheat, moduleKeys: ["field-crop-management"] },
  { name: "Crop Trials", href: "/crop-trials", icon: FlaskConical, moduleKeys: ["field-crop-management"] },
  { name: "Spray Records", href: "/sprays", icon: Droplets, moduleKeys: ["sprays-inputs", "viticulture", "fresh-produce"] },
  { name: "NMP", href: "/nmp", icon: Leaf, moduleKeys: ["sprays-inputs"] },
  { name: "NVZ Compliance", href: "/nvz", icon: FlaskConical, moduleKeys: ["sprays-inputs"] },
  { name: "Soil Tests", href: "/soil", icon: TestTube, moduleKeys: ["soil-management"] },
  { name: "Equipment", href: "/equipment", icon: Tractor, moduleKeys: ["equipment-management"] },
  { name: "Workshop", href: "/workshop", icon: Wrench, moduleKeys: ["workshop-management"] }
];
const livestockNav = [
  { name: "Herds & Animals", href: "/livestock", icon: HeartPulse, moduleKeys: ["livestock-management", "sheep-production", "beef-production", "goat-production", "organic-livestock", "organic-dairy"], requiresLivestock: true },
  { name: "Movements", href: "/movements", icon: Truck, moduleKeys: ["livestock-management", "sheep-production", "beef-production", "goat-production", "pig-production"], requiresLivestock: true },
  { name: "Medicine", href: "/medicine", icon: HeartPulse, moduleKeys: ["livestock-management", "sheep-production", "beef-production", "goat-production", "pig-production", "poultry-production"], requiresLivestock: true },
  { name: "Herd Health Register", href: "/herd-health-register", icon: ClipboardList, moduleKeys: ["livestock-management", "sheep-production", "beef-production", "goat-production"], requiresLivestock: true },
  { name: "Health Dashboard", href: "/livestock-health", icon: ChartColumn, moduleKeys: ["livestock-management", "sheep-production", "beef-production", "goat-production"], requiresLivestock: true },
  { name: "Dairy Records", href: "/dairy", icon: Milk, moduleKeys: ["dairy-management", "organic-dairy"], requiresLivestock: true },
  { name: "Dairy Restock", href: "/dairy-restock", icon: Package, moduleKeys: ["dairy-management", "sheep-dairy", "goat-dairy", "organic-dairy", "organic-sheep-dairy", "organic-goat-dairy"] },
  { name: "Sheep Dairy", href: "/sheep-dairy", icon: Milk, moduleKeys: ["sheep-dairy"] },
  { name: "Goat Dairy", href: "/goat-dairy", icon: Milk, moduleKeys: ["goat-dairy"] },
  { name: "Feed Management", href: "/feed", icon: Package, moduleKeys: ["feed-management"] },
  { name: "Vet Ledger", href: "/vet-ledger", icon: Stethoscope, moduleKeys: ["livestock-management", "sheep-production", "beef-production", "goat-production", "pig-production", "poultry-production"], requiresLivestock: true },
  { name: "TB Testing Register", href: "/tb-tests", icon: TestTube, moduleKeys: ["livestock-management", "beef-production", "sheep-production", "goat-production", "organic-livestock", "organic-dairy", "organic-sheep-dairy", "organic-goat-dairy"], requiresLivestock: true },
  { name: "Lambing Records", href: "/lambing", icon: Scissors, moduleKeys: ["sheep-production", "organic-livestock", "organic-sheep-dairy"] },
  { name: "Annual Health Reviews", href: "/ahwr", icon: ClipboardList, moduleKeys: ["livestock-management", "sheep-production", "beef-production", "goat-production", "pig-production", "poultry-production", "organic-livestock", "organic-dairy", "organic-sheep-dairy", "organic-goat-dairy", "organic-venison"] }
];
const biosecurityNav = [
  { name: "Farm Map", href: "/farm-map", icon: Map, moduleKeys: ["biosecurity"] },
  { name: "Farm Locations", href: "/farm-locations", icon: MapPin, moduleKeys: ["biosecurity"] },
  { name: "Visitor Log", href: "/visitors", icon: Users, moduleKeys: ["biosecurity"] },
  { name: "Pest Control", href: "/pest-control", icon: Bug, moduleKeys: ["biosecurity"] },
  { name: "Cleaning", href: "/cleaning", icon: ShieldCheck, moduleKeys: ["biosecurity"] },
  { name: "COSHH Assessments", href: "/coshh", icon: ShieldAlert, moduleKeys: ["biosecurity"] },
  { name: "Compliance & Plans", href: "/compliance", icon: FileText, moduleKeys: ["biosecurity"] }
];
const complianceNav = [
  { name: "Inspections", href: "/inspections", icon: ClipboardCheck, moduleKeys: ["inspections"] },
  { name: "Health, Safety & Risk", href: "/risks", icon: ShieldAlert, moduleKeys: ["risk-waste"] },
  { name: "Waste", href: "/waste", icon: Trash2, moduleKeys: ["risk-waste"] },
  { name: "Fly-Tipping", href: "/fly-tipping", icon: TriangleAlert, moduleKeys: ["risk-waste"] },
  { name: "Encampments", href: "/encampments", icon: TriangleAlert, moduleKeys: ["risk-waste"] },
  { name: "Farm Incidents", href: "/farm-incidents", icon: Flame, moduleKeys: ["risk-waste"] },
  { name: "Accident Book", href: "/accident-book", icon: BookOpen, moduleKeys: ["risk-waste"] },
  { name: "Contractors H&S File", href: "/contractors", icon: ClipboardCheck, moduleKeys: ["risk-waste"] },
  { name: "Insurance", href: "/insurance", icon: ShieldCheck },
  { name: "AMR Report", href: "/amr-report", icon: FlaskConical, moduleKeys: ["livestock-management", "sheep-production", "beef-production", "goat-production", "pig-production", "poultry-production", "organic-livestock", "organic-dairy", "organic-sheep-dairy", "organic-goat-dairy", "organic-venison"] }
];
const organicFarmingNav = [
  { name: "Organic Compliance", href: "/organic", icon: Leaf, moduleKeys: ["organic-compliance"] },
  { name: "Organic Livestock", href: "/organic-livestock", icon: HeartPulse, moduleKeys: ["organic-livestock"] },
  { name: "Organic Dairy", href: "/organic-dairy", icon: Milk, moduleKeys: ["organic-dairy"] },
  { name: "Organic Sheep Dairy", href: "/organic-sheep-dairy", icon: Milk, moduleKeys: ["organic-sheep-dairy"] },
  { name: "Organic Goat Dairy", href: "/organic-goat-dairy", icon: Milk, moduleKeys: ["organic-goat-dairy"] },
  { name: "Organic Fresh Produce", href: "/organic-fresh-produce", icon: Leaf, moduleKeys: ["organic-fresh-produce"] },
  { name: "Organic Viticulture", href: "/organic-viticulture", icon: Grape, moduleKeys: ["organic-viticulture"] },
  { name: "Organic Arable", href: "/organic-arable", icon: Wheat, moduleKeys: ["organic-arable"] },
  { name: "Organic Venison", href: "/organic-venison", icon: Leaf, moduleKeys: ["organic-venison"] },
  { name: "Organic Poultry", href: "/organic-poultry", icon: Bird, moduleKeys: ["organic-poultry"] }
];
const specialistNav = [
  { name: "Pig Production", href: "/pig-production", icon: PiggyBank, moduleKeys: ["pig-production"] },
  { name: "Poultry Production", href: "/poultry-production", icon: Bird, moduleKeys: ["poultry-production"] },
  { name: "Poultry NCP / Salmonella", href: "/poultry-ncp", icon: FlaskConical, moduleKeys: ["poultry-production", "organic-poultry"] },
  { name: "Sheep Production", href: "/sheep-production", icon: Scissors, moduleKeys: ["sheep-production"] },
  { name: "Goat Production", href: "/goat-production", icon: HeartPulse, moduleKeys: ["goat-production"] },
  { name: "Venison Production", href: "/venison-production", icon: Crosshair, moduleKeys: ["venison-production"] },
  { name: "Beef Production", href: "/beef-production", icon: Scale, moduleKeys: ["beef-production"] },
  { name: "Fresh Produce", href: "/fresh-produce", icon: ShoppingBag, moduleKeys: ["fresh-produce"] },
  { name: "Viticulture", href: "/viticulture", icon: TreePine, moduleKeys: ["viticulture"] },
  { name: "Farm Diversification", href: "/diversification", icon: Building2, moduleKeys: ["farm-diversification"] },
  { name: "Equine", href: "/equine", icon: Zap, moduleKeys: ["farm-diversification", "equine"] },
  { name: "Beekeeping", href: "/beekeeping", icon: Boxes, moduleKeys: ["beekeeping"] },
  { name: "Water & Irrigation", href: "/water-irrigation", icon: Waves, moduleKeys: ["water-irrigation"] }
];
const financeNav = [
  { name: "Financial", href: "/financial", icon: PoundSterling, moduleKeys: ["financial-records"], minRole: "manager" },
  { name: "Sales & Trading", href: "/sales-trading", icon: TrendingUp, moduleKeys: ["financial-records"], minRole: "manager" },
  { name: "Trade History", href: "/trade-history", icon: ChartColumn, moduleKeys: ["financial-records"], minRole: "manager" },
  { name: "Trade Contacts & Stock", href: "/stock", icon: Package, moduleKeys: ["stock-suppliers"] },
  { name: "Farm Services", href: "/farm-services", icon: Building2 },
  { name: "SFI / ELM", href: "/sfi", icon: Leaf, moduleKeys: ["environmental"] },
  { name: "Grants & Funding", href: "/grants", icon: Landmark },
  { name: "Haulage", href: "/haulage", icon: Truck, moduleKeys: ["haulage-transport"] }
];
const environmentalNav = [
  { name: "Environmental", href: "/environmental", icon: Leaf, moduleKeys: ["environmental"] },
  { name: "Woodland & Felling", href: "/woodland", icon: TreePine, moduleKeys: ["environmental"] },
  { name: "Regenerative Farming", href: "/regenerative", icon: Sprout, moduleKeys: ["environmental"] },
  { name: "Carbon & Sustainability", href: "/carbon", icon: Recycle, moduleKeys: ["carbon-sustainability"] },
  { name: "Biofuel / RTFO", href: "/biofuel", icon: Fuel, moduleKeys: ["biofuel-rtfo"] },
  { name: "Fuel & Energy", href: "/fuel-energy", icon: Fuel, moduleKeys: ["fuel-energy"] }
];
const reportingNav = [
  { name: "Business Reports", href: "/business-reports", icon: ChartColumn, moduleKeys: ["business-reports"], minRole: "manager" },
  { name: "Season Reports", href: "/season-reports", icon: FileChartColumn, moduleKeys: ["field-crop-management", "livestock-management"] },
  { name: "Harvest Dashboard", href: "/harvest-dashboard", icon: ChartColumn, moduleKeys: ["field-crop-management"] },
  { name: "NVZ Status Board", href: "/nvz-dashboard", icon: Gauge, moduleKeys: ["sprays-inputs"] },
  { name: "Soil Health", href: "/soil-dashboard", icon: FlaskConical, moduleKeys: ["soil-management"] },
  { name: "Fleet Status", href: "/fleet-dashboard", icon: Wrench, moduleKeys: ["equipment-management"] }
];
const documentsNav = [
  { name: "Documents", href: "/documents", icon: FileText, moduleKeys: ["document-management"] }
];
const integrationsNav = [
  { name: "Data API Access", href: "/data-api", icon: Database, moduleKeys: ["data-api"] },
  { name: "Report Builder", href: "/report-builder", icon: ChartColumn, moduleKeys: ["report-builder"] }
];
const ROLE_RANK = { operator: 0, senior: 1, manager: 2, owner: 3 };
const bottomNav = [
  { name: "Help Centre", href: "/help", icon: CircleQuestionMark },
  { name: "Support", href: "/support", icon: LifeBuoy },
  { name: "Farm Settings", href: "/settings/farm", icon: MapPin, minRole: "manager" },
  { name: "Lookup Lists", href: "/settings/lookups", icon: List, minRole: "manager" },
  { name: "Account & Notifications", href: "/account", icon: Smartphone },
  { name: "SMS & Alert Settings", href: "/sms-alerts", icon: Bell, minRole: "manager" },
  { name: "Settings", href: "/settings", icon: Settings, minRole: "manager" }
];
function filterNavItems(items, activeModuleKeys, sectors, userRole = "owner") {
  return items.filter((item) => {
    if (item.requiresLivestock && !sectors.hasLivestock) return false;
    if (item.minRole && ROLE_RANK[userRole] < ROLE_RANK[item.minRole]) return false;
    if (!item.moduleKeys || item.moduleKeys.length === 0) return true;
    return item.moduleKeys.some((key) => activeModuleKeys.has(key));
  });
}
function NavSection({ title, items, onNavClick }) {
  const [location] = useLocation();
  if (items.length === 0) return null;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-2", children: [
    title && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "px-4 mb-1 text-[10px] uppercase tracking-widest font-bold text-white/30", children: title }),
    items.map((item) => {
      const isActive = location === item.href;
      return /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { href: item.href, className: "block", onClick: onNavClick, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: cn(
        "flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-200 group cursor-pointer text-sm",
        isActive ? "bg-sidebar-active text-white font-medium shadow-inner shadow-black/20" : "text-sidebar-foreground/80 hover:bg-white/5 hover:text-white"
      ), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(item.icon, { className: cn("w-4 h-4 transition-colors", isActive ? "text-primary" : "text-sidebar-foreground/50 group-hover:text-white/80") }),
        item.name
      ] }) }, item.name);
    })
  ] });
}
function SidebarInner({
  onNavClick,
  onLogout,
  currentFarmName,
  currentFarmRedTractorId,
  filteredCoreNav,
  filteredPeopleNav,
  filteredFarmManagementNav,
  filteredLivestockNav,
  filteredBiosecurityNav,
  filteredComplianceNav,
  filteredOrganicFarmingNav,
  filteredSpecialistNav,
  filteredFinanceNav,
  filteredEnvironmentalNav,
  filteredReportingNav,
  filteredDocumentsNav,
  filteredIntegrationsNav,
  filteredBottomNav,
  trialInfo
}) {
  const navRef = reactExports.useRef(null);
  const [, setLocation] = useLocation();
  const { setFarmId } = useAppStore();
  const versionFull = useAppVersion();
  reactExports.useEffect(() => {
    const el = navRef.current;
    if (!el) return;
    const saved = sessionStorage.getItem("sidebar-nav-scroll");
    if (saved) el.scrollTop = parseInt(saved, 10);
  }, []);
  reactExports.useEffect(() => {
    const el = navRef.current;
    if (!el) return;
    const save = () => sessionStorage.setItem("sidebar-nav-scroll", String(el.scrollTop));
    el.addEventListener("scroll", save, { passive: true });
    return () => el.removeEventListener("scroll", save);
  }, []);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-shrink-0 bg-white/[0.07] border-b border-white/[0.06]", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-5 flex items-center gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20", children: /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: `${"/dashboard/"}images/logo-icon.png`, alt: "Logo", className: "w-6 h-6 object-contain" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-lg font-display font-bold text-white tracking-wide", children: "BDE Farm Trac" }),
          currentFarmRedTractorId ? /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-[10px] text-sidebar-foreground/70 uppercase tracking-wider font-semibold", children: [
            "RT ID: ",
            currentFarmRedTractorId
          ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] text-sidebar-foreground/70 uppercase tracking-wider font-semibold", children: "Red Tractor" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "px-3 py-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          className: "w-full block",
          onClick: () => {
            setFarmId(null);
            setLocation("/select");
            onNavClick?.();
          },
          children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "w-full flex items-center justify-between px-4 py-2.5 bg-white/5 hover:bg-white/10 rounded-xl transition-colors border border-white/5 cursor-pointer group", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col text-left", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] text-white/50 font-medium group-hover:text-white/70 transition-colors", children: "Switch Farm" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-semibold text-white", children: currentFarmName || "Select Farm" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronDown, { className: "w-4 h-4 text-white/50 group-hover:text-white/70 transition-colors" })
          ] })
        }
      ) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("nav", { ref: navRef, className: "flex-1 px-3 py-3 space-y-0 overflow-y-auto", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(NavSection, { items: filteredCoreNav, onNavClick }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(NavSection, { title: "People & Workforce", items: filteredPeopleNav, onNavClick }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(NavSection, { title: "Farm Management", items: filteredFarmManagementNav, onNavClick }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(NavSection, { title: "Livestock & Dairy", items: filteredLivestockNav, onNavClick }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(NavSection, { title: "Biosecurity", items: filteredBiosecurityNav, onNavClick }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(NavSection, { title: "Compliance & Safety", items: filteredComplianceNav, onNavClick }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(NavSection, { title: "Organic Farming", items: filteredOrganicFarmingNav, onNavClick }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(NavSection, { title: "Specialist Modules", items: filteredSpecialistNav, onNavClick }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(NavSection, { title: "Finance & Commercial", items: filteredFinanceNav, onNavClick }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(NavSection, { title: "Environmental", items: filteredEnvironmentalNav, onNavClick }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(NavSection, { title: "Reporting", items: filteredReportingNav, onNavClick }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(NavSection, { title: "Documents", items: filteredDocumentsNav, onNavClick }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(NavSection, { title: "Integrations & API", items: filteredIntegrationsNav, onNavClick })
    ] }),
    trialInfo && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mx-3 mb-2 flex-shrink-0", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: cn(
      "rounded-xl px-4 py-3 border",
      trialInfo.daysRemaining !== null && trialInfo.daysRemaining <= 2 ? "bg-red-500/15 border-red-500/30" : trialInfo.daysRemaining !== null && trialInfo.daysRemaining <= 7 ? "bg-amber-500/15 border-amber-500/30" : "bg-emerald-500/10 border-emerald-500/20"
    ), children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5 mb-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Zap, { className: cn(
          "w-3.5 h-3.5 shrink-0",
          trialInfo.daysRemaining !== null && trialInfo.daysRemaining <= 2 ? "text-red-400" : trialInfo.daysRemaining !== null && trialInfo.daysRemaining <= 7 ? "text-amber-400" : "text-emerald-400"
        ) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: cn(
          "text-xs font-semibold",
          trialInfo.daysRemaining !== null && trialInfo.daysRemaining <= 2 ? "text-red-400" : trialInfo.daysRemaining !== null && trialInfo.daysRemaining <= 7 ? "text-amber-400" : "text-emerald-400"
        ), children: trialInfo.daysRemaining === 0 ? "Trial expires today" : trialInfo.daysRemaining === 1 ? "1 day left in trial" : trialInfo.daysRemaining !== null ? `${trialInfo.daysRemaining} days left in trial` : "Free trial active" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] text-white/45 mb-2.5 leading-relaxed", children: "All modules unlocked. Subscribe before your trial ends to keep your records." }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { href: "/settings", onClick: onNavClick, children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: cn(
        "w-full text-xs font-semibold px-3 py-1.5 rounded-lg text-center transition-colors",
        trialInfo.daysRemaining !== null && trialInfo.daysRemaining <= 2 ? "bg-red-500 hover:bg-red-600 text-white" : trialInfo.daysRemaining !== null && trialInfo.daysRemaining <= 7 ? "bg-amber-500 hover:bg-amber-600 text-white" : "bg-primary/80 hover:bg-primary text-white"
      ), children: "Choose a Plan" }) })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-shrink-0 bg-white/[0.07] border-t border-white/[0.06]", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-3 space-y-0", children: [
      filteredBottomNav.map((item) => /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { href: item.href, className: "block", onClick: onNavClick, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 px-4 py-2.5 rounded-xl text-sidebar-foreground/80 hover:bg-white/5 hover:text-white transition-colors cursor-pointer text-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(item.icon, { className: "w-4 h-4 text-sidebar-foreground/50" }),
        item.name
      ] }) }, item.name)),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "button",
        {
          onClick: onLogout,
          className: "w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sidebar-foreground/80 hover:bg-red-500/10 hover:text-red-400 transition-colors cursor-pointer text-sm",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(LogOut, { className: "w-4 h-4 opacity-50" }),
            "Sign Out"
          ]
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-center text-[10px] text-white/25 pt-1 pb-0.5 select-none", children: [
        "v",
        versionFull
      ] })
    ] }) })
  ] });
}
function Sidebar({ isOpen = false, onClose }) {
  const { farmId, clearState } = useAppStore();
  const { signOut } = useSafeClerk();
  const [, setLocation] = useLocation();
  const { role: userRole } = useUserRole();
  const { data: farmDetail } = useQuery({
    queryKey: ["farm-detail", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}`).then((r) => r.json()),
    enabled: !!farmId
  });
  const { data: dashboardData } = useQuery({
    queryKey: ["farm-dashboard", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/dashboard`).then((r) => r.json()),
    enabled: !!farmId
  });
  const currentFarm = farmDetail?.record;
  const activeModuleKeys = reactExports.useMemo(() => {
    const keys = /* @__PURE__ */ new Set();
    const subs = dashboardData?.activeSubscriptions;
    if (Array.isArray(subs)) {
      for (const sub of subs) {
        const s = sub;
        if (s.moduleKey) keys.add(s.moduleKey);
      }
    }
    return keys;
  }, [dashboardData?.activeSubscriptions]);
  const farmSectors = reactExports.useMemo(() => {
    const farm = dashboardData?.farm;
    if (!farm) return { hasLivestock: true };
    const hasLivestock = !!(farm.sectorBeef || farm.sectorDairy || farm.sectorPigs || farm.sectorPoultry);
    return { hasLivestock };
  }, [dashboardData?.farm]);
  const trialInfo = reactExports.useMemo(() => {
    const subs = dashboardData?.activeSubscriptions;
    if (!Array.isArray(subs)) return null;
    const trialSubs = subs.filter((s) => s.status === "trial");
    if (trialSubs.length === 0) return null;
    const withEnd = trialSubs.filter((s) => s.currentPeriodEnd);
    if (withEnd.length === 0) return { daysRemaining: null, endsAt: null };
    const earliest = withEnd.reduce(
      (a, b) => new Date(a.currentPeriodEnd).getTime() < new Date(b.currentPeriodEnd).getTime() ? a : b
    );
    const msRemaining = new Date(earliest.currentPeriodEnd).getTime() - Date.now();
    const daysRemaining = Math.max(0, Math.ceil(msRemaining / (1e3 * 60 * 60 * 24)));
    return { daysRemaining, endsAt: earliest.currentPeriodEnd };
  }, [dashboardData?.activeSubscriptions]);
  const filteredCoreNav = filterNavItems(coreNav, activeModuleKeys, farmSectors, userRole);
  const filteredPeopleNav = filterNavItems(peopleNav, activeModuleKeys, farmSectors, userRole);
  const filteredFarmManagementNav = filterNavItems(farmManagementNav, activeModuleKeys, farmSectors, userRole);
  const filteredLivestockNav = filterNavItems(livestockNav, activeModuleKeys, farmSectors, userRole);
  const filteredBiosecurityNav = filterNavItems(biosecurityNav, activeModuleKeys, farmSectors, userRole);
  const filteredComplianceNav = filterNavItems(complianceNav, activeModuleKeys, farmSectors, userRole);
  const filteredOrganicFarmingNav = filterNavItems(organicFarmingNav, activeModuleKeys, farmSectors, userRole);
  const filteredSpecialistNav = filterNavItems(specialistNav, activeModuleKeys, farmSectors, userRole);
  const filteredFinanceNav = filterNavItems(financeNav, activeModuleKeys, farmSectors, userRole);
  const filteredEnvironmentalNav = filterNavItems(environmentalNav, activeModuleKeys, farmSectors, userRole);
  const filteredReportingNav = filterNavItems(reportingNav, activeModuleKeys, farmSectors, userRole);
  const filteredDocumentsNav = filterNavItems(documentsNav, activeModuleKeys, farmSectors, userRole);
  const filteredIntegrationsNav = filterNavItems(integrationsNav, activeModuleKeys, farmSectors, userRole);
  const filteredBottomNav = filterNavItems(bottomNav, /* @__PURE__ */ new Set(), { hasLivestock: true }, userRole);
  const handleLogout = () => {
    clearState();
    signOut(() => setLocation("/"));
  };
  const sidebarBaseClasses = "flex flex-col w-64 bg-sidebar text-sidebar-foreground border-r border-sidebar-border h-screen";
  const innerProps = {
    onLogout: handleLogout,
    currentFarmName: currentFarm?.name,
    currentFarmRedTractorId: currentFarm?.redTractorId ?? null,
    filteredCoreNav,
    filteredPeopleNav,
    filteredFarmManagementNav,
    filteredLivestockNav,
    filteredBiosecurityNav,
    filteredComplianceNav,
    filteredOrganicFarmingNav,
    filteredSpecialistNav,
    filteredFinanceNav,
    filteredEnvironmentalNav,
    filteredReportingNav,
    filteredDocumentsNav,
    filteredIntegrationsNav,
    filteredBottomNav,
    trialInfo
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: cn(sidebarBaseClasses, "hidden md:flex sticky top-0"), children: /* @__PURE__ */ jsxRuntimeExports.jsx(SidebarInner, { ...innerProps }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: cn(
      sidebarBaseClasses,
      "fixed inset-y-0 left-0 z-[60] transition-transform duration-300",
      isOpen ? "translate-x-0" : "-translate-x-full"
    ), children: /* @__PURE__ */ jsxRuntimeExports.jsx(SidebarInner, { ...innerProps, onNavClick: onClose }) })
  ] });
}
function notificationsKey(farmId) {
  return ["notifications", farmId];
}
function useNotifications(farmId) {
  return useQuery({
    queryKey: notificationsKey(farmId ?? 0),
    queryFn: () => customFetch(`/api/farms/${farmId}/notifications`),
    enabled: !!farmId,
    refetchInterval: 6e4,
    staleTime: 3e4
  });
}
function useMarkNotificationRead(farmId) {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: (notifId) => customFetch(`/api/farms/${farmId}/notifications/${notifId}/read`, { method: "PUT" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: notificationsKey(farmId ?? 0) }),
    onError: () => toast({ title: "Failed to mark notification as read", variant: "destructive" })
  });
}
function useMarkAllRead(farmId) {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: () => customFetch(`/api/farms/${farmId}/notifications/read-all`, { method: "PUT" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: notificationsKey(farmId ?? 0) }),
    onError: () => toast({ title: "Failed to mark all as read", variant: "destructive" })
  });
}
function useDeleteNotification(farmId) {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: (notifId) => customFetch(`/api/farms/${farmId}/notifications/${notifId}`, { method: "DELETE" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: notificationsKey(farmId ?? 0) }),
    onError: () => toast({ title: "Failed to delete notification", variant: "destructive" })
  });
}
function severityIcon(severity) {
  switch (severity) {
    case "critical":
      return /* @__PURE__ */ jsxRuntimeExports.jsx(CircleAlert, { className: "w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" });
    case "warning":
      return /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { className: "w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" });
    default:
      return /* @__PURE__ */ jsxRuntimeExports.jsx(Info, { className: "w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" });
  }
}
function severityBg(severity) {
  switch (severity) {
    case "critical":
      return "bg-red-50 border-l-red-400";
    case "warning":
      return "bg-amber-50 border-l-amber-400";
    default:
      return "bg-blue-50 border-l-blue-400";
  }
}
function relativeTime(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 6e4);
  if (mins < 2) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days === 1) return "Yesterday";
  return `${days} days ago`;
}
function NotificationItem({ notif, farmId, onClose }) {
  const { mutate: markRead } = useMarkNotificationRead(farmId);
  const { mutate: deleteNotif } = useDeleteNotification(farmId);
  const handleMarkRead = (e) => {
    e.stopPropagation();
    if (!notif.isRead) markRead(notif.id);
  };
  const handleDelete = (e) => {
    e.stopPropagation();
    deleteNotif(notif.id);
  };
  const handleClick = () => {
    if (!notif.isRead) markRead(notif.id);
    onClose();
  };
  const href = notif.relatedModule === "inspections" ? "/inspections" : `/${notif.relatedModule ?? "dashboard"}`;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: cn(
    "group relative border-l-4 px-4 py-3 transition-colors cursor-pointer",
    severityBg(notif.severity),
    !notif.isRead ? "opacity-100" : "opacity-60"
  ), onClick: handleClick, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { href, className: "block", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-3 items-start", children: [
      severityIcon(notif.severity),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: cn("text-sm font-semibold text-foreground leading-tight", !notif.isRead && "font-bold"), children: notif.title }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-foreground/70 mt-0.5 leading-snug line-clamp-2", children: notif.message }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] text-foreground/40 mt-1 font-medium", children: relativeTime(notif.createdAt) })
      ] }),
      !notif.isRead && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-1" })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "absolute top-2 right-2 hidden group-hover:flex gap-1", children: [
      !notif.isRead && /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          title: "Mark as read",
          onClick: handleMarkRead,
          className: "p-1 rounded bg-white/80 hover:bg-white text-foreground/50 hover:text-primary transition-colors",
          children: /* @__PURE__ */ jsxRuntimeExports.jsx(CheckCheck, { className: "w-3 h-3" })
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          title: "Dismiss",
          onClick: handleDelete,
          className: "p-1 rounded bg-white/80 hover:bg-white text-foreground/50 hover:text-red-500 transition-colors",
          children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "w-3 h-3" })
        }
      )
    ] })
  ] });
}
function NotificationPanel() {
  const { farmId } = useAppStore();
  const [open, setOpen] = reactExports.useState(false);
  const panelRef = reactExports.useRef(null);
  const { data } = useNotifications(farmId);
  const { mutate: markAllRead } = useMarkAllRead(farmId);
  const notifications = data?.notifications ?? [];
  const unreadCount = data?.unreadCount ?? 0;
  reactExports.useEffect(() => {
    function handleClickOutside(e) {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", ref: panelRef, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "button",
      {
        className: "flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-xl bg-white border border-border shadow-sm hover:shadow-md transition-all text-foreground/70 cursor-pointer min-w-[36px]",
        onClick: () => setOpen((prev) => !prev),
        "aria-label": "Open notifications",
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Bell, { className: "w-5 h-5" }),
          unreadCount > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] font-bold text-red-500 leading-none", children: unreadCount > 99 ? "99+" : unreadCount }) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] leading-none opacity-0 select-none", children: "0" })
        ]
      }
    ),
    open && /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "div",
      {
        className: "absolute right-0 top-12 w-[360px] rounded-2xl shadow-2xl border border-border/50 z-[100] overflow-hidden",
        style: { background: "#ffffff" },
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between px-4 py-3 border-b border-border/50", style: { background: "#ffffff" }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Bell, { className: "w-4 h-4 text-primary" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-display font-bold text-foreground text-sm", children: "Notifications" }),
              unreadCount > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "bg-primary/10 text-primary text-[10px] font-bold px-1.5 py-0.5 rounded-full", children: [
                unreadCount,
                " new"
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
              unreadCount > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs(
                "button",
                {
                  onClick: () => markAllRead(),
                  className: "text-xs text-primary hover:text-primary/80 font-medium flex items-center gap-1 cursor-pointer",
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(CheckCheck, { className: "w-3 h-3" }),
                    "Mark all read"
                  ]
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setOpen(false), className: "p-1 rounded hover:bg-black/5 cursor-pointer", children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "w-4 h-4 text-foreground/40" }) })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "max-h-[420px] overflow-y-auto divide-y divide-border/30", children: notifications.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center justify-center py-12 text-center px-6", style: { background: "#ffffff" }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ClipboardCheck, { className: "w-6 h-6 text-primary" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-semibold text-foreground text-sm", children: "All clear" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-foreground/50 mt-1", children: "No alerts right now — your farm is on track." })
          ] }) : notifications.map((notif) => /* @__PURE__ */ jsxRuntimeExports.jsx(
            NotificationItem,
            {
              notif,
              farmId,
              onClose: () => setOpen(false)
            },
            notif.id
          )) }),
          notifications.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "border-t border-border/50 px-4 py-2.5", style: { background: "#f9fafb" }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { href: "/inspections", onClick: () => setOpen(false), children: /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { className: "w-full text-xs text-foreground/50 hover:text-primary transition-colors flex items-center justify-center gap-1 cursor-pointer", children: [
            "View all in Inspections",
            /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, { className: "w-3 h-3" })
          ] }) }) })
        ]
      }
    )
  ] });
}
var ROOT_NAME = "AlertDialog";
var [createAlertDialogContext] = createContextScope(ROOT_NAME, [
  createDialogScope
]);
var useDialogScope = createDialogScope();
var AlertDialog$1 = (props) => {
  const { __scopeAlertDialog, ...alertDialogProps } = props;
  const dialogScope = useDialogScope(__scopeAlertDialog);
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Root, { ...dialogScope, ...alertDialogProps, modal: true });
};
AlertDialog$1.displayName = ROOT_NAME;
var TRIGGER_NAME = "AlertDialogTrigger";
var AlertDialogTrigger = reactExports.forwardRef(
  (props, forwardedRef) => {
    const { __scopeAlertDialog, ...triggerProps } = props;
    const dialogScope = useDialogScope(__scopeAlertDialog);
    return /* @__PURE__ */ jsxRuntimeExports.jsx(Trigger, { ...dialogScope, ...triggerProps, ref: forwardedRef });
  }
);
AlertDialogTrigger.displayName = TRIGGER_NAME;
var PORTAL_NAME = "AlertDialogPortal";
var AlertDialogPortal$1 = (props) => {
  const { __scopeAlertDialog, ...portalProps } = props;
  const dialogScope = useDialogScope(__scopeAlertDialog);
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Portal, { ...dialogScope, ...portalProps });
};
AlertDialogPortal$1.displayName = PORTAL_NAME;
var OVERLAY_NAME = "AlertDialogOverlay";
var AlertDialogOverlay$1 = reactExports.forwardRef(
  (props, forwardedRef) => {
    const { __scopeAlertDialog, ...overlayProps } = props;
    const dialogScope = useDialogScope(__scopeAlertDialog);
    return /* @__PURE__ */ jsxRuntimeExports.jsx(Overlay, { ...dialogScope, ...overlayProps, ref: forwardedRef });
  }
);
AlertDialogOverlay$1.displayName = OVERLAY_NAME;
var CONTENT_NAME = "AlertDialogContent";
var [AlertDialogContentProvider, useAlertDialogContentContext] = createAlertDialogContext(CONTENT_NAME);
var Slottable = createSlottable("AlertDialogContent");
var AlertDialogContent$1 = reactExports.forwardRef(
  (props, forwardedRef) => {
    const { __scopeAlertDialog, children, ...contentProps } = props;
    const dialogScope = useDialogScope(__scopeAlertDialog);
    const contentRef = reactExports.useRef(null);
    const composedRefs = useComposedRefs(forwardedRef, contentRef);
    const cancelRef = reactExports.useRef(null);
    return /* @__PURE__ */ jsxRuntimeExports.jsx(
      WarningProvider,
      {
        contentName: CONTENT_NAME,
        titleName: TITLE_NAME,
        docsSlug: "alert-dialog",
        children: /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialogContentProvider, { scope: __scopeAlertDialog, cancelRef, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
          Content,
          {
            role: "alertdialog",
            ...dialogScope,
            ...contentProps,
            ref: composedRefs,
            onOpenAutoFocus: composeEventHandlers(contentProps.onOpenAutoFocus, (event) => {
              event.preventDefault();
              cancelRef.current?.focus({ preventScroll: true });
            }),
            onPointerDownOutside: (event) => event.preventDefault(),
            onInteractOutside: (event) => event.preventDefault(),
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Slottable, { children }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(DescriptionWarning, { contentRef })
            ]
          }
        ) })
      }
    );
  }
);
AlertDialogContent$1.displayName = CONTENT_NAME;
var TITLE_NAME = "AlertDialogTitle";
var AlertDialogTitle$1 = reactExports.forwardRef(
  (props, forwardedRef) => {
    const { __scopeAlertDialog, ...titleProps } = props;
    const dialogScope = useDialogScope(__scopeAlertDialog);
    return /* @__PURE__ */ jsxRuntimeExports.jsx(Title, { ...dialogScope, ...titleProps, ref: forwardedRef });
  }
);
AlertDialogTitle$1.displayName = TITLE_NAME;
var DESCRIPTION_NAME = "AlertDialogDescription";
var AlertDialogDescription$1 = reactExports.forwardRef((props, forwardedRef) => {
  const { __scopeAlertDialog, ...descriptionProps } = props;
  const dialogScope = useDialogScope(__scopeAlertDialog);
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Description, { ...dialogScope, ...descriptionProps, ref: forwardedRef });
});
AlertDialogDescription$1.displayName = DESCRIPTION_NAME;
var ACTION_NAME = "AlertDialogAction";
var AlertDialogAction$1 = reactExports.forwardRef(
  (props, forwardedRef) => {
    const { __scopeAlertDialog, ...actionProps } = props;
    const dialogScope = useDialogScope(__scopeAlertDialog);
    return /* @__PURE__ */ jsxRuntimeExports.jsx(Close, { ...dialogScope, ...actionProps, ref: forwardedRef });
  }
);
AlertDialogAction$1.displayName = ACTION_NAME;
var CANCEL_NAME = "AlertDialogCancel";
var AlertDialogCancel$1 = reactExports.forwardRef(
  (props, forwardedRef) => {
    const { __scopeAlertDialog, ...cancelProps } = props;
    const { cancelRef } = useAlertDialogContentContext(CANCEL_NAME, __scopeAlertDialog);
    const dialogScope = useDialogScope(__scopeAlertDialog);
    const ref = useComposedRefs(forwardedRef, cancelRef);
    return /* @__PURE__ */ jsxRuntimeExports.jsx(Close, { ...dialogScope, ...cancelProps, ref });
  }
);
AlertDialogCancel$1.displayName = CANCEL_NAME;
var DescriptionWarning = ({ contentRef }) => {
  const MESSAGE = `\`${CONTENT_NAME}\` requires a description for the component to be accessible for screen reader users.

You can add a description to the \`${CONTENT_NAME}\` by passing a \`${DESCRIPTION_NAME}\` component as a child, which also benefits sighted users by adding visible context to the dialog.

Alternatively, you can use your own component as a description by assigning it an \`id\` and passing the same value to the \`aria-describedby\` prop in \`${CONTENT_NAME}\`. If the description is confusing or duplicative for sighted users, you can use the \`@radix-ui/react-visually-hidden\` primitive as a wrapper around your description component.

For more information, see https://radix-ui.com/primitives/docs/components/alert-dialog`;
  reactExports.useEffect(() => {
    const hasDescription = document.getElementById(
      contentRef.current?.getAttribute("aria-describedby")
    );
    if (!hasDescription) console.warn(MESSAGE);
  }, [MESSAGE, contentRef]);
  return null;
};
var Root2 = AlertDialog$1;
var Portal2 = AlertDialogPortal$1;
var Overlay2 = AlertDialogOverlay$1;
var Content2 = AlertDialogContent$1;
var Action = AlertDialogAction$1;
var Cancel = AlertDialogCancel$1;
var Title2 = AlertDialogTitle$1;
var Description2 = AlertDialogDescription$1;
const AlertDialog = Root2;
const AlertDialogPortal = Portal2;
const AlertDialogOverlay = reactExports.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx(
  Overlay2,
  {
    className: cn(
      "fixed inset-0 z-50 bg-black/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className
    ),
    ...props,
    ref
  }
));
AlertDialogOverlay.displayName = Overlay2.displayName;
const AlertDialogContent = reactExports.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogPortal, { children: [
  /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialogOverlay, {}),
  /* @__PURE__ */ jsxRuntimeExports.jsx(
    Content2,
    {
      ref,
      className: cn(
        "fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg",
        className
      ),
      ...props
    }
  )
] }));
AlertDialogContent.displayName = Content2.displayName;
const AlertDialogHeader = ({
  className,
  ...props
}) => /* @__PURE__ */ jsxRuntimeExports.jsx(
  "div",
  {
    className: cn(
      "flex flex-col space-y-2 text-center sm:text-left",
      className
    ),
    ...props
  }
);
AlertDialogHeader.displayName = "AlertDialogHeader";
const AlertDialogFooter = ({
  className,
  ...props
}) => /* @__PURE__ */ jsxRuntimeExports.jsx(
  "div",
  {
    className: cn(
      "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2",
      className
    ),
    ...props
  }
);
AlertDialogFooter.displayName = "AlertDialogFooter";
const AlertDialogTitle = reactExports.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx(
  Title2,
  {
    ref,
    className: cn("text-lg font-semibold", className),
    ...props
  }
));
AlertDialogTitle.displayName = Title2.displayName;
const AlertDialogDescription = reactExports.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx(
  Description2,
  {
    ref,
    className: cn("text-sm text-muted-foreground", className),
    ...props
  }
));
AlertDialogDescription.displayName = Description2.displayName;
const AlertDialogAction = reactExports.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx(
  Action,
  {
    ref,
    className: cn(buttonVariants(), className),
    ...props
  }
));
AlertDialogAction.displayName = Action.displayName;
const AlertDialogCancel = reactExports.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx(
  Cancel,
  {
    ref,
    className: cn(
      buttonVariants({ variant: "outline" }),
      "mt-2 sm:mt-0",
      className
    ),
    ...props
  }
));
AlertDialogCancel.displayName = Cancel.displayName;
function useSandboxInfo() {
  const { tenantSlug } = useAppStore();
  return useQuery({
    queryKey: ["sandbox-info", tenantSlug],
    queryFn: () => fetch("/api/tenants/current/sandbox-info").then((r) => r.json()),
    enabled: !!tenantSlug,
    staleTime: 3e4
  });
}
function SandboxBanner() {
  const [, setLocation] = useLocation();
  const { tenantSlug, setTenantSlug, setFarmId } = useAppStore();
  const { data: sandboxInfo } = useSandboxInfo();
  const { data: tenantsData } = useGetMyTenants();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [showResetDialog, setShowResetDialog] = reactExports.useState(false);
  const isSandbox = sandboxInfo?.isSandbox ?? false;
  const currentTenant = tenantsData?.tenants?.find(
    (t) => t.tenantSlug === tenantSlug
  );
  const isSuperAdmin = currentTenant?.isSuperAdmin ?? false;
  const { mutate: resetSandbox, isPending: isResetting } = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/tenants/current/sandbox/reset", {
        method: "POST"
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? "Reset failed");
      }
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries();
      toast({
        title: "Sandbox reset",
        description: `Cleared ${data.deleted} record(s) across ${data.farmCount} farm(s). Your farm structure is intact.`
      });
      setShowResetDialog(false);
    },
    onError: (err) => {
      toast({ title: "Reset failed", description: err.message, variant: "destructive" });
      setShowResetDialog(false);
    }
  });
  const handleReturnToLive = () => {
    const liveSlug = sandboxInfo?.liveTenant?.slug;
    if (liveSlug) {
      setTenantSlug(liveSlug);
    } else {
      setFarmId(null);
      localStorage.removeItem("farmtrac_tenantSlug");
    }
    setLocation("/select-context");
  };
  if (!isSandbox) return null;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-amber-400 text-amber-950 px-4 py-2.5 flex items-center justify-between gap-4 shrink-0 sticky top-0 z-50", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2.5 min-w-0", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { className: "w-4 h-4 shrink-0" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-semibold tracking-wide uppercase", children: "Sandbox — Test Environment" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "hidden sm:inline text-sm font-normal opacity-80", children: "• Data entered here will not affect your live account and no real-world integrations will fire." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 shrink-0", children: [
        isSuperAdmin && /* @__PURE__ */ jsxRuntimeExports.jsxs(
          Button,
          {
            size: "sm",
            variant: "ghost",
            className: "h-7 px-3 text-amber-950 hover:bg-amber-500 hover:text-amber-950 text-xs font-medium",
            onClick: () => setShowResetDialog(true),
            disabled: isResetting,
            children: [
              isResetting ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "w-3.5 h-3.5 mr-1.5 animate-spin" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(RotateCcw, { className: "w-3.5 h-3.5 mr-1.5" }),
              "Reset Sandbox"
            ]
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          Button,
          {
            size: "sm",
            className: "h-7 px-3 bg-amber-950 hover:bg-amber-900 text-amber-50 text-xs font-medium",
            onClick: handleReturnToLive,
            children: [
              "Return to Live Dashboard",
              /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowRight, { className: "w-3.5 h-3.5 ml-1.5" })
            ]
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialog, { open: showResetDialog, onOpenChange: setShowResetDialog, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogContent, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogHeader, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialogTitle, { children: "Reset sandbox data?" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialogDescription, { children: "This will permanently delete all records entered in this sandbox (sprays, livestock movements, compliance logs, etc.). Your farm structure, settings, and credentials will be preserved. This cannot be undone." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialogCancel, { disabled: isResetting, children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          AlertDialogAction,
          {
            onClick: () => resetSandbox(),
            disabled: isResetting,
            className: "bg-destructive hover:bg-destructive/90",
            children: [
              isResetting && /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "w-4 h-4 mr-2 animate-spin" }),
              "Yes, reset sandbox"
            ]
          }
        )
      ] })
    ] }) })
  ] });
}
function AppLayout({ children, title }) {
  const { farmId } = useAppStore();
  const { data: farmDetail } = useQuery({
    queryKey: ["farm-detail", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}`).then((r) => r.json()),
    enabled: !!farmId
  });
  const farmName = farmDetail?.record?.name;
  const [sidebarOpen, setSidebarOpen] = reactExports.useState(false);
  const [location] = useLocation();
  const { registerTitle, goBack, backLabel } = useNavHistory();
  reactExports.useEffect(() => {
    if (title) registerTitle(title, location);
  }, [title, location, registerTitle]);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex min-h-screen w-full bg-background", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Sidebar, { isOpen: sidebarOpen, onClose: () => setSidebarOpen(false) }),
    sidebarOpen && /* @__PURE__ */ jsxRuntimeExports.jsx(
      "div",
      {
        className: "fixed inset-0 z-30 bg-black/50",
        onClick: () => setSidebarOpen(false)
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 flex flex-col overflow-hidden relative", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(SandboxBanner, {}),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("header", { className: "h-20 flex items-center justify-between px-8 bg-background border-b border-border/50 sticky top-0 z-40", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              className: "md:hidden p-2 rounded-lg hover:bg-black/5 cursor-pointer",
              onClick: () => setSidebarOpen((prev) => !prev),
              "aria-label": "Toggle navigation menu",
              children: /* @__PURE__ */ jsxRuntimeExports.jsx(Menu, { className: "w-6 h-6" })
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
            backLabel && /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "button",
              {
                onClick: goBack,
                className: "flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors bg-muted/40 hover:bg-muted px-2.5 py-1.5 rounded-full border border-border/60 shrink-0",
                title: `Back to ${backLabel}`,
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowLeft, { className: "w-3 h-3" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "hidden sm:inline", children: backLabel })
                ]
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              title && /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-2xl font-display font-bold text-foreground leading-tight", children: title }),
              farmName && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground -mt-0.5", children: farmName })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(NotificationPanel, {}),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-10 h-10 rounded-full bg-gradient-to-tr from-primary to-primary/60 border-2 border-white shadow-md flex items-center justify-center text-white font-bold", children: "JD" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("main", { className: "flex-1 overflow-y-auto p-4 md:p-8", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "max-w-6xl mx-auto space-y-8 pb-12", children }) })
    ] })
  ] });
}
export {
  Grape as $,
  AppLayout as A,
  BookOpen as B,
  CalendarDays as C,
  AlertDialogAction as D,
  Flame as E,
  Fuel as F,
  Gauge as G,
  HeartPulse as H,
  Info as I,
  CloudSun as J,
  Recycle as K,
  Landmark as L,
  CheckCheck as M,
  Navigation as N,
  Settings as O,
  Boxes as P,
  LayoutDashboard as Q,
  RotateCcw as R,
  Sprout as S,
  TrendingUp as T,
  Users as U,
  PiggyBank as V,
  Warehouse as W,
  Bird as X,
  Scissors as Y,
  Zap as Z,
  Crosshair as _,
  Wheat as a,
  Milk as a0,
  FileChartColumn as a1,
  Layers as b,
  ClipboardList as c,
  Wrench as d,
  ChartColumn as e,
  Scale as f,
  TreePine as g,
  List as h,
  TestTube as i,
  Truck as j,
  Stethoscope as k,
  ShoppingBag as l,
  LifeBuoy as m,
  Shovel as n,
  LogOut as o,
  Bell as p,
  Smartphone as q,
  Bug as r,
  AlertDialog as s,
  AlertDialogContent as t,
  useUserRole as u,
  AlertDialogHeader as v,
  AlertDialogTitle as w,
  AlertDialogDescription as x,
  AlertDialogFooter as y,
  AlertDialogCancel as z
};

import { CoolifyEnv, FlyEnv, NeonVercelEnv, NetlifyEnv, RailwayEnv, RenderEnv, SupabaseVercelEnv, UploadThingEnv, UploadThingV6Env, UpstashRedisEnv, VercelEnv, ViteEnv, WxtEnv } from "./presets-CmsjZ_tS.js";

//#region src/presets-zod.d.ts
/**
* Vercel System Environment Variables
* @see https://vercel.com/docs/projects/environment-variables/system-environment-variables#system-environment-variables
*/
/**
* Vercel System Environment Variables
* @see https://vercel.com/docs/projects/environment-variables/system-environment-variables#system-environment-variables
*/
declare const vercel: () => Readonly<VercelEnv>;
/**
* Neon for Vercel Environment Variables
* @see https://neon.tech/docs/guides/vercel-native-integration#environment-variables-set-by-the-integration
*/
declare const neonVercel: () => Readonly<NeonVercelEnv>;
/**
* Supabase for Vercel Environment Variables
* @see https://vercel.com/marketplace/supabase
*/
declare const supabaseVercel: () => Readonly<SupabaseVercelEnv>;
/**
* @see https://v6.docs.uploadthing.com/getting-started/nuxt#add-env-variables
*/
declare const uploadthingV6: () => Readonly<UploadThingV6Env>;
/**
* @see https://docs.uploadthing.com/getting-started/appdir#add-env-variables
*/
declare const uploadthing: () => Readonly<UploadThingEnv>;
/**
* Render System Environment Variables
* @see https://docs.render.com/environment-variables#all-runtimes
*/
declare const render: () => Readonly<RenderEnv>;
/**
* Railway Environment Variables
* @see https://docs.railway.app/reference/variables#railway-provided-variables
*/
declare const railway: () => Readonly<RailwayEnv>;
/**
* Fly.io Environment Variables
* @see https://fly.io/docs/machines/runtime-environment/#environment-variables
*/
declare const fly: () => Readonly<FlyEnv>;
/**
* Netlify Environment Variables
* @see https://docs.netlify.com/configure-builds/environment-variables
*/
declare const netlify: () => Readonly<NetlifyEnv>;
/**
* Upstash redis Environment Variables
* @see https://upstash.com/docs/redis/howto/connectwithupstashredis
*/
declare const upstashRedis: () => Readonly<UpstashRedisEnv>;
/**
* Coolify Environment Variables
* @see https://coolify.io/docs/knowledge-base/environment-variables#predefined-variables
*/
declare const coolify: () => Readonly<CoolifyEnv>;
/**
* Vite Environment Variables
* @see https://vite.dev/guide/env-and-mode
*/
declare const vite: () => Readonly<ViteEnv>;
/**
* WXT Environment Variables
* @see https://wxt.dev/guide/essentials/config/environment-variables.html#built-in-environment-variables
*/
declare const wxt: () => Readonly<WxtEnv>;

//#endregion
export { coolify, fly, neonVercel, netlify, railway, render, supabaseVercel, uploadthing, uploadthingV6, upstashRedis, vercel, vite, wxt };
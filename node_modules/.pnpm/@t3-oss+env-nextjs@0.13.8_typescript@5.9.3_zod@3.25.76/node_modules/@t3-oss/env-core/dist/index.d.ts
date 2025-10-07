//#region src/standard.d.ts
/** The Standard Schema interface. */
interface StandardSchemaV1<Input = unknown, Output = Input> {
  /** The Standard Schema properties. */
  readonly "~standard": StandardSchemaV1.Props<Input, Output>;
}
declare namespace StandardSchemaV1 {
  /** The Standard Schema properties interface. */
  export interface Props<Input = unknown, Output = Input> {
    /** The version number of the standard. */
    readonly version: 1;
    /** The vendor name of the schema library. */
    readonly vendor: string;
    /** Validates unknown input values. */
    readonly validate: (value: unknown) => Result<Output> | Promise<Result<Output>>;
    /** Inferred types associated with the schema. */
    readonly types?: Types<Input, Output> | undefined;
  }
  /** The result interface of the validate function. */
  export type Result<Output> = SuccessResult<Output> | FailureResult;
  /** The result interface if validation succeeds. */
  export interface SuccessResult<Output> {
    /** The typed output value. */
    readonly value: Output;
    /** The non-existent issues. */
    readonly issues?: undefined;
  }
  /** The result interface if validation fails. */
  export interface FailureResult {
    /** The issues of failed validation. */
    readonly issues: ReadonlyArray<Issue>;
  }
  /** The issue interface of the failure output. */
  export interface Issue {
    /** The error message of the issue. */
    readonly message: string;
    /** The path of the issue, if any. */
    readonly path?: ReadonlyArray<PropertyKey | PathSegment> | undefined;
  }
  /** The path segment interface of the issue. */
  export interface PathSegment {
    /** The key representing a path segment. */
    readonly key: PropertyKey;
  }
  /** The Standard Schema types interface. */
  export interface Types<Input = unknown, Output = Input> {
    /** The input type of the schema. */
    readonly input: Input;
    /** The output type of the schema. */
    readonly output: Output;
  }
  /** Infers the input type of a Standard Schema. */
  export type InferInput<Schema extends StandardSchemaV1> = NonNullable<Schema["~standard"]["types"]>["input"];
  /** Infers the output type of a Standard Schema. */
  export type InferOutput<Schema extends StandardSchemaV1> = NonNullable<Schema["~standard"]["types"]>["output"];
}
type StandardSchemaDictionary<Input = Record<string, unknown>, Output extends Record<keyof Input, unknown> = Input> = { [K in keyof Input]-?: StandardSchemaV1<Input[K], Output[K]> };
declare namespace StandardSchemaDictionary {
  type InferInput<T extends StandardSchemaDictionary> = { [K in keyof T]: StandardSchemaV1.InferInput<T[K]> };
  type InferOutput<T extends StandardSchemaDictionary> = { [K in keyof T]: StandardSchemaV1.InferOutput<T[K]> };
} //#endregion
//#region src/index.d.ts
/**
* Symbol for indicating type errors
* @internal
*/
type ErrorMessage<T extends string> = T;
/**
* Simplify a type
* @internal
*/
type Simplify<T> = { [P in keyof T]: T[P] } & {};
/**
* Get the keys of the possibly undefined values
* @internal
*/
type PossiblyUndefinedKeys<T> = { [K in keyof T]: undefined extends T[K] ? K : never }[keyof T];
/**
* Make the keys of the type possibly undefined
* @internal
*/
type UndefinedOptional<T> = Partial<Pick<T, PossiblyUndefinedKeys<T>>> & Omit<T, PossiblyUndefinedKeys<T>>;
/**
* Make the keys of the type impossible
* @internal
*/
// biome-ignore lint/suspicious/noExplicitAny: <explanation>
type Impossible<T extends Record<string, any>> = Partial<Record<keyof T, never>>;
/**
* Reverse a Readonly object to be mutable
* @internal
*/
type Mutable<T> = T extends Readonly<infer U> ? U : T;
/**
* Reduce an array of records to a single object where later keys override earlier ones
* @internal
*/
type Reduce<TArr extends Record<string, unknown>[], TAcc = object> = TArr extends [] ? TAcc : TArr extends [infer Head, ...infer Tail] ? Tail extends Record<string, unknown>[] ? Mutable<Head> & Omit<Reduce<Tail, TAcc>, keyof Head> : never : never;
/**
* The options that can be passed to the `createEnv` function.
*/
interface BaseOptions<TShared extends StandardSchemaDictionary, TExtends extends Array<Record<string, unknown>>> {
  /**
  * How to determine whether the app is running on the server or the client.
  * @default typeof window === "undefined"
  */
  isServer?: boolean;
  /**
  * Shared variables, often those that are provided by build tools and is available to both client and server,
  * but isn't prefixed and doesn't require to be manually supplied. For example `NODE_ENV`, `VERCEL_URL` etc.
  */
  shared?: TShared;
  /**
  * Extend presets
  */
  extends?: TExtends;
  /**
  * Called when validation fails. By default the error is logged,
  * and an error is thrown telling what environment variables are invalid.
  */
  onValidationError?: (issues: readonly StandardSchemaV1.Issue[]) => never;
  /**
  * Called when a server-side environment variable is accessed on the client.
  * By default an error is thrown.
  */
  onInvalidAccess?: (variable: string) => never;
  /**
  * Whether to skip validation of environment variables.
  * @default false
  */
  skipValidation?: boolean;
  /**
  * By default, this library will feed the environment variables directly to
  * the Zod validator.
  *
  * This means that if you have an empty string for a value that is supposed
  * to be a number (e.g. `PORT=` in a ".env" file), Zod will incorrectly flag
  * it as a type mismatch violation. Additionally, if you have an empty string
  * for a value that is supposed to be a string with a default value (e.g.
  * `DOMAIN=` in an ".env" file), the default value will never be applied.
  *
  * In order to solve these issues, we recommend that all new projects
  * explicitly specify this option as true.
  */
  emptyStringAsUndefined?: boolean;
}
/**
* Using this interface doesn't validate all environment variables are specified
* in the `runtimeEnv` object. You may want to use `StrictOptions` instead if
* your framework performs static analysis and tree-shakes unused variables.
*/
interface LooseOptions<TShared extends StandardSchemaDictionary, TExtends extends Array<Record<string, unknown>>> extends BaseOptions<TShared, TExtends> {
  runtimeEnvStrict?: never;
  /**
  * What object holds the environment variables at runtime. This is usually
  * `process.env` or `import.meta.env`.
  */
  // Unlike `runtimeEnvStrict`, this doesn't enforce that all environment variables are set.
  runtimeEnv: Record<string, string | boolean | number | undefined>;
}
/**
* Using this interface validates all environment variables are specified
* in the `runtimeEnv` object. If you miss one, you'll get a type error. Useful
* if you want to make sure all environment variables are set for frameworks that
* perform static analysis and tree-shakes unused variables.
*/
interface StrictOptions<TPrefix extends string | undefined, TServer extends StandardSchemaDictionary, TClient extends StandardSchemaDictionary, TShared extends StandardSchemaDictionary, TExtends extends Array<Record<string, unknown>>> extends BaseOptions<TShared, TExtends> {
  /**
  * Runtime Environment variables to use for validation - `process.env`, `import.meta.env` or similar.
  * Enforces all environment variables to be set. Required in for example Next.js Edge and Client runtimes.
  */
  runtimeEnvStrict: Record<{ [TKey in keyof TClient]: TPrefix extends undefined ? never : TKey extends `${TPrefix}${string}` ? TKey : never }[keyof TClient] | { [TKey in keyof TServer]: TPrefix extends undefined ? TKey : TKey extends `${TPrefix}${string}` ? never : TKey }[keyof TServer] | { [TKey in keyof TShared]: TKey extends string ? TKey : never }[keyof TShared], string | boolean | number | undefined>;
  runtimeEnv?: never;
}
/**
* This interface is used to define the client-side environment variables.
* It's used in conjunction with the `clientPrefix` option to ensure
* that all client-side variables are prefixed with the same string.
* Common examples of prefixes are `NEXT_PUBLIC_`, `NUXT_PUBLIC` or `PUBLIC_`.
*/
interface ClientOptions<TPrefix extends string | undefined, TClient extends StandardSchemaDictionary> {
  /**
  * The prefix that client-side variables must have. This is enforced both at
  * a type-level and at runtime.
  */
  clientPrefix: TPrefix;
  /**
  * Specify your client-side environment variables schema here. This way you can ensure the app isn't
  * built with invalid env vars.
  */
  client: Partial<{ [TKey in keyof TClient]: TKey extends `${TPrefix}${string}` ? TClient[TKey] : ErrorMessage<`${TKey extends string ? TKey : never} is not prefixed with ${TPrefix}.`> }>;
}
/**
* This interface is used to define the schema for your
* server-side environment variables.
*/
interface ServerOptions<TPrefix extends string | undefined, TServer extends StandardSchemaDictionary> {
  /**
  * Specify your server-side environment variables schema here. This way you can ensure the app isn't
  * built with invalid env vars.
  */
  server: Partial<{ [TKey in keyof TServer]: TPrefix extends undefined ? TServer[TKey] : TPrefix extends "" ? TServer[TKey] : TKey extends `${TPrefix}${string}` ? ErrorMessage<`${TKey extends `${TPrefix}${string}` ? TKey : never} should not prefixed with ${TPrefix}.`> : TServer[TKey] }>;
}
interface CreateSchemaOptions<TServer extends StandardSchemaDictionary, TClient extends StandardSchemaDictionary, TShared extends StandardSchemaDictionary, TFinalSchema extends StandardSchemaV1<{}, {}>> {
  /**
  * A custom function to combine the schemas.
  * Can be used to add further refinement or transformation.
  */
  createFinalSchema?: (shape: TServer & TClient & TShared, isServer: boolean) => TFinalSchema;
}
type ServerClientOptions<TPrefix extends string | undefined, TServer extends StandardSchemaDictionary, TClient extends StandardSchemaDictionary> = (ClientOptions<TPrefix, TClient> & ServerOptions<TPrefix, TServer>) | (ServerOptions<TPrefix, TServer> & Impossible<ClientOptions<never, never>>) | (ClientOptions<TPrefix, TClient> & Impossible<ServerOptions<never, never>>);
type EnvOptions<TPrefix extends string | undefined, TServer extends StandardSchemaDictionary, TClient extends StandardSchemaDictionary, TShared extends StandardSchemaDictionary, TExtends extends Array<Record<string, unknown>>, TFinalSchema extends StandardSchemaV1<{}, {}>> = ((LooseOptions<TShared, TExtends> & ServerClientOptions<TPrefix, TServer, TClient>) | (StrictOptions<TPrefix, TServer, TClient, TShared, TExtends> & ServerClientOptions<TPrefix, TServer, TClient>)) & CreateSchemaOptions<TServer, TClient, TShared, TFinalSchema>;
type TPrefixFormat = string | undefined;
type TServerFormat = StandardSchemaDictionary;
type TClientFormat = StandardSchemaDictionary;
type TSharedFormat = StandardSchemaDictionary;
type TExtendsFormat = Array<Record<string, unknown>>;
type DefaultCombinedSchema<TServer extends TServerFormat, TClient extends TClientFormat, TShared extends TSharedFormat> = StandardSchemaV1<{}, UndefinedOptional<StandardSchemaDictionary.InferOutput<TServer & TClient & TShared>>>;
type CreateEnv<TFinalSchema extends StandardSchemaV1<{}, {}>, TExtends extends TExtendsFormat> = Readonly<Simplify<Reduce<[StandardSchemaV1.InferOutput<TFinalSchema>, ...TExtends]>>>;
/**
* Create a new environment variable schema.
*/
declare function createEnv<TPrefix extends TPrefixFormat, TServer extends TServerFormat = NonNullable<unknown>, TClient extends TClientFormat = NonNullable<unknown>, TShared extends TSharedFormat = NonNullable<unknown>, const TExtends extends TExtendsFormat = [], TFinalSchema extends StandardSchemaV1<{}, {}> = DefaultCombinedSchema<TServer, TClient, TShared>>(opts: EnvOptions<TPrefix, TServer, TClient, TShared, TExtends, TFinalSchema>): CreateEnv<TFinalSchema, TExtends>;

//#endregion
export { BaseOptions, ClientOptions, CreateEnv, CreateSchemaOptions, DefaultCombinedSchema, EnvOptions, LooseOptions, ServerClientOptions, ServerOptions, StandardSchemaDictionary, StandardSchemaV1, StrictOptions, createEnv };
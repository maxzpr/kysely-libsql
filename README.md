# kysely-libsql

Forked from [Libsql/kysely-libsql][libsql]

A [Kysely][kysely] using the [@maxzpr/client][libsql-client-ts] from Turso official sdk.

[libsql]: https://github.com/libsql/kysely-libsql
[kysely]: https://github.com/koskimas/kysely

## Installation

```shell
npm install @maxzpr/kysely-libsql-client
```

## Usage

Pass a `LibsqlDialect` instance as the `dialect` when creating the `Kysely` object:

```typescript
import { Kysely } from "kysely";
import { LibsqlDialect } from "@maxzpr/kysely-libsql-client";

interface Database {
    ...
}

const db = new Kysely<Database>({
    dialect: new LibsqlDialect({
        url: "libsql://localhost:8080?tls=0",
        authToken: "<token>", // optional
    }),
});

// or
const db = new Kysely<Database>({
    dialect: new LibsqlDialect({
        url: "libsql://localhost:8080?authToken=<token>"
    }),
});
```

## Supported URLs

The library accepts the [same URL schemas][supported-urls] as [`@maxzpr/client`][libsql-client-ts] except `file:`:

- `http://` and `https://` connect to a libsql server over HTTP,
- `ws://` and `wss://` connect to the server over WebSockets,
- `libsql://` connects to the server using the default protocol (which is now HTTP). `libsql://` URLs use TLS by default, but you can use `?tls=0` to disable TLS (e.g. when you run your own instance of the server locally).

Connecting to a local SQLite file using `file:` URL is not supported; we suggest that you use the native Kysely dialect for SQLite.

[libsql-client-ts]: https://github.com/libsql/libsql-client-ts
[supported-urls]: https://github.com/libsql/libsql-client-ts#supported-urls

## License

This project is licensed under the MIT license.

### Contribution

Unless you explicitly state otherwise, any contribution intentionally submitted for inclusion in `@maxzpr/kysely-libsql-client` by you, shall be licensed as MIT, without any additional terms or conditions.

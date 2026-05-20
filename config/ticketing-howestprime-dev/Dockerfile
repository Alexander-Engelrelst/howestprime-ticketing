FROM denoland/deno:2.2.4

WORKDIR /app

USER deno

COPY --chown=deno:deno deno.json ./

COPY --chown=deno:deno config/asyncapi.yaml ./config/asyncapi.yaml

COPY --chown=deno:deno src/ ./src

RUN deno cache src/main.ts

EXPOSE 8000

CMD ["run", "--allow-net", "--allow-env", "--allow-sys=osRelease", "src/main.ts"]
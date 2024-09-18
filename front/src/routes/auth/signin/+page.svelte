<script lang="ts">
  import { api, setCookieAccessToken } from "$lib/utils";
  import { user } from "$lib/stores";
  import { goto } from "$app/navigation";
  import { InputPassword, InputText } from "$lib/components";
  import { clsx } from "clsx";
  import { AxiosError } from "axios";

  let username = "";
  let password = "";

  let errorMessage: string | null = null;

  async function signIn() {
    try {
      const { data } = await api.post("/auth/signin", {
        username,
        password,
      });

      setCookieAccessToken(data.data.accessToken);
      user.set(data.data.user);

      goto("/");
    } catch (error) {
      if (error instanceof AxiosError) {
        if (error.response) {
          errorMessage = error.response.data.message;

          username = "";
          password = "";
        }
      }
    }
  }
</script>

<div class="flex min-h-dvh w-full items-center justify-center">
  <main
    class={clsx(
      "flex w-[25rem] flex-col items-start rounded-md border border-black bg-white px-6 py-8",
      errorMessage ? "gap-4" : "gap-10",
    )}
  >
    <div class="w-full">
      <h1 class="text-3xl/[100%] font-semibold">Masuk</h1>
    </div>

    <div class="flex w-full flex-col items-start gap-6">
      {#if errorMessage}
        <span class="text-base/[100%] text-red-500">{errorMessage}</span>
      {/if}

      <form
        on:submit|preventDefault={signIn}
        class="flex w-full flex-col items-start gap-8"
      >
        <div class="flex w-full flex-col items-start gap-6">
          <InputText
            bind:value={username}
            props={{
              text: "Nama",
              id: "nama",
              placeholder: "Masukkan nama",
            }}
          />

          <InputPassword
            bind:value={password}
            props={{
              text: "Kata sandi",
              id: "password",
              placeholder: "Masukkan kata sandi",
            }}
          />
        </div>

        <button
          class="flex h-10 w-full items-center justify-center rounded-sm bg-black text-base/[100%] font-bold text-white"
          >Masuk</button
        >
      </form>

      <div class="flex w-full items-center justify-center">
        <span class="text-base/[100%]"
          >Belum punya akun ? <a
            href="/auth/signup"
            class="font-bold underline">Daftar</a
          ></span
        >
      </div>
    </div>
  </main>
</div>

<script lang="ts">
  import { goto } from "$app/navigation";
  import { user } from "$lib/stores";
  import { InputPassword, InputText } from "$lib/components";
  import { clsx } from "clsx";
  import { api, setCookieAccessToken } from "$lib/utils";
  import { AxiosError } from "axios";

  let username = "";
  let password = "";
  let confirmPassword = "";

  let errorMessage: string | null = null;

  async function signUp() {
    try {
      const { data } = await api.post("/auth/signup", {
        username,
        password,
        confirmPassword,
      });

      setCookieAccessToken(data.data.accessToken);
      user.set(data.data.user);

      goto("/");
    } catch (error) {
      if (error instanceof AxiosError) {
        if (error.response) {
          errorMessage = error.response.data.message;

          if (error.response.data.errorType === "DuplicateUserError") {
            username = "";
          }

          password = "";
          confirmPassword = "";
        }
      }
    }
  }
</script>

<div
  class="flex min-h-dvh w-full items-center justify-center bg-havelock-blue-950"
>
  <main
    class={clsx(
      "flex w-[25rem] flex-col items-start rounded-md bg-white px-6 py-8",
      errorMessage ? "gap-4" : "gap-10",
    )}
  >
    <div class="w-full">
      <h1 class="text-3xl/[100%] font-semibold">Daftar</h1>
    </div>

    <div class="flex w-full flex-col items-start gap-6">
      {#if errorMessage}
        <span class="text-base/[100%] text-red-500">{errorMessage}</span>
      {/if}

      <form
        on:submit|preventDefault={signUp}
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

          <InputPassword
            bind:value={confirmPassword}
            props={{
              text: "Konfirmasi kata sandi",
              id: "confirmPassword",
              placeholder: "Masukkan konfirmasi kata sandi",
            }}
          />
        </div>

        <button
          class="flex h-10 w-full items-center justify-center rounded-sm bg-havelock-blue-800 px-4 text-base/[100%] font-bold text-white"
          >Daftar</button
        >
      </form>

      <div class="flex w-full items-center justify-center">
        <span class="text-base/[100%]"
          >Sudah punya akun ? <a
            href="/auth/signin"
            class="font-bold text-havelock-blue-800 underline">Masuk</a
          ></span
        >
      </div>
    </div>
  </main>
</div>

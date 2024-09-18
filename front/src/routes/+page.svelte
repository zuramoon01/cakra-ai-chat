<script lang="ts">
  import { goto } from "$app/navigation";
  import { user } from "$lib/stores";
  import { revokeCookieAccessToken } from "$lib/utils";

  function signOut() {
    revokeCookieAccessToken();
    user.set(null);

    goto("/auth/signin");
  }
</script>

<div class="flex min-h-dvh w-full">
  <div class="w-80 min-w-80 border border-r-black px-2 py-4">
    <div class="flex w-full items-center justify-between gap-1">
      <h1 class="text-2xl/[100%] font-bold">Chat App</h1>

      <button
        type="button"
        on:click={signOut}
        class="rounded-sm bg-black px-4 py-2 text-base/[100%] font-bold text-white"
        >Keluar</button
      >
    </div>

    <div></div>
  </div>
  <div class="w-full min-w-80"></div>
</div>

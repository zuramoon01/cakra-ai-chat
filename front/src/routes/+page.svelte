<script lang="ts">
  import { goto } from "$app/navigation";
  import { PUBLIC_BACKEND_URL } from "$env/static/public";
  import { user } from "$lib/stores";
  import type { Room, User } from "$lib/types";
  import { api, revokeCookieAccessToken } from "$lib/utils";
  import clsx from "clsx";
  import { io, Socket } from "socket.io-client";
  import { onMount } from "svelte";

  const socket = io(PUBLIC_BACKEND_URL);

  let search = "";
  let searchResults: User[] | null = null;

  let selectedRoom:
    | (Room & {
        messages: Array<{
          id: number;
          senderId: string;
          message: string;
          createdAt: string;
        }>;
      })
    | null = null;
  let rooms: Room[] = [];

  async function searchUser() {
    try {
      const { data } = await api.get(`/user?search=${search}`);

      searchResults = data.data;
    } catch (error) {
      console.log(error);
    }
  }

  async function getRooms() {
    try {
      const { data } = await api.get("/room");

      rooms = data.data;
    } catch (error) {
      console.log(error);
    }
  }

  async function setSelectedRoom(userId: string) {
    try {
      const { data } = await api.post("/room", {
        userId,
      });

      await getRooms();

      selectedRoom = data.data;
      searchResults = null;
      search = "";
    } catch (error) {
      console.log(error);
    }
  }

  async function getMessages(id: number) {
    try {
      const { data } = await api.get(`/message/${id}`);

      selectedRoom!.messages = data.data;

      socket.emit("join_room", selectedRoom!.id);
    } catch (error) {
      console.log(error);
    }
  }

  let message = "";
  async function sendMessage() {
    if (selectedRoom) {
      try {
        const { data } = await api.post("/message", {
          roomId: selectedRoom.id,
          message,
        });

        socket.emit("send_message", { ...data.data, roomId: selectedRoom.id });

        selectedRoom.messages.push(data.data);
        selectedRoom = selectedRoom;
        message = "";
      } catch (error) {
        console.log(error);
      }
    }
  }

  async function getUser() {
    try {
      const { data } = await api.get("/auth/reauthenticate");

      user.set(data.data.user);
    } catch (error) {
      signOut();
    }
  }

  function signOut() {
    revokeCookieAccessToken();
    user.set(null);

    goto("/auth/signin");
  }

  onMount(async () => {
    await getUser();
    await getRooms();

    socket.emit("setup", $user);
    socket.on("connection", () => {});

    socket.on("receive_message", (message) => {
      if (selectedRoom?.id === message.roomId) {
        const { roomId, ...newMessage } = message;

        selectedRoom?.messages.push(newMessage);
        selectedRoom = selectedRoom;
      }
    });
  });
</script>

<div
  class="grid min-h-dvh w-full grid-cols-[minmax(20rem,_25rem),_minmax(20rem,_1fr)] text-havelock-blue-50"
>
  <div
    class="flex w-full flex-col items-start gap-4 bg-havelock-blue-900 px-4 py-6"
  >
    <div class="flex w-full items-center justify-between gap-1">
      <h1 class="text-2xl/[100%] font-bold">Chat App</h1>

      <button
        type="button"
        on:click={signOut}
        class="flex h-10 items-center justify-center rounded-sm bg-havelock-blue-800 px-4 text-base/[100%] font-bold"
        >Keluar</button
      >
    </div>

    <form
      on:submit|preventDefault={searchUser}
      class="flex w-full items-start"
    >
      <input
        type="text"
        id="search"
        name="search"
        bind:value={search}
        placeholder={"Cari pengguna"}
        class="h-10 w-full rounded-l-sm px-4 text-base/[100%] text-black"
      />

      <button
        class="flex h-10 items-center justify-center rounded-r-sm bg-havelock-blue-800 px-4 text-base/[100%] font-bold"
        >Cari</button
      >
    </form>

    <div
      class="flex w-full flex-col items-start divide-y-[1px] divide-white/10"
    >
      <!-- svelte-ignore a11y-no-static-element-interactions -->
      <!-- svelte-ignore a11y-click-events-have-key-events -->
      {#if searchResults}
        {#each searchResults as user (user.id)}
          <div
            on:click={() => {
              setSelectedRoom(user.id);
            }}
            class={clsx(
              "flex w-full cursor-pointer flex-col items-start gap-1 p-2",
              "hover:bg-white/10",
            )}
          >
            <h2 class="text-base/[100%] font-semibold">{user.username}</h2>
            <span class="text-sm/[100%]">Recent chat</span>
          </div>
        {/each}
      {:else}
        {#each rooms as room (room.id)}
          <div
            on:click={() => {
              selectedRoom = { ...room, messages: [] };
              getMessages(room.id);
            }}
            class={clsx(
              "flex w-full items-center justify-between p-2",
              selectedRoom?.id === room.id
                ? "bg-white/10"
                : ["cursor-pointer", "hover:bg-white/10"],
            )}
          >
            <div class="flex flex-col items-start gap-1">
              <h2 class="text-base/[100%] font-semibold">
                {room.isGroup
                  ? room.name
                  : room.members[0].id === $user?.id
                    ? room.members[1].username
                    : room.members[0].username}
              </h2>
              <span class="text-sm/[100%]">Recent chat</span>
            </div>

            <div class="flex flex-col items-start gap-1">
              <span class="text-xs/[100%]">00:00</span>
            </div>
          </div>
        {/each}
      {/if}
    </div>
  </div>

  <div class="flex w-full min-w-80 flex-col items-start bg-havelock-blue-950">
    {#if selectedRoom && $user}
      <div class="flex h-full w-full flex-col items-start">
        <div class="w-full flex-col items-start gap-1 bg-white/5 p-4">
          <h2 class="text-base/[100%] font-semibold">
            {selectedRoom.isGroup
              ? selectedRoom.name
              : selectedRoom.members[0].username}
          </h2>
        </div>

        <div
          class="flex h-full w-full flex-col items-start justify-end gap-1 p-4"
        >
          {#each selectedRoom.messages as message (message.id)}
            <div
              class={clsx(
                "rounded-full bg-white/10 px-4 py-2",
                $user.id === message.senderId ? "self-end" : "",
              )}
            >
              <span class="block text-sm/[100%]">{message.message}</span>
            </div>
          {/each}
        </div>
      </div>

      <form
        on:submit|preventDefault={sendMessage}
        class="flex w-full items-start gap-4 bg-white/10 p-4"
      >
        <input
          type="text"
          id="message"
          name="message"
          bind:value={message}
          placeholder={"Pesan"}
          class="h-10 w-full rounded-lg px-4 text-base/[100%] text-black"
        />

        <button
          class="flex h-10 items-center justify-center rounded-lg bg-havelock-blue-800 px-4 text-base/[100%] font-bold"
          >Kirim</button
        >
      </form>
    {/if}
  </div>
</div>

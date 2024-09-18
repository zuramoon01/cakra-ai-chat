<script lang="ts">
  import { inputClass, inputLabelClass } from "./style";

  export let value: string;
  export let props: {
    text: string;
    id: string;
    placeholder: string;
  };

  const { text, id, placeholder } = props;
</script>

<div class="relative w-full">
  <label
    for={id}
    class={inputLabelClass}>{text}</label
  >

  <input
    type="text"
    id={id}
    name={id}
    bind:value={value}
    placeholder={placeholder}
    class={inputClass}
  />
</div>

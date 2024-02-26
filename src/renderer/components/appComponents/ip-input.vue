<template>
  <div>
    <input type="text" v-model="ipAddress" @input="formatIpAddress" />
  </div>
</template>

<script>
export default {
  name: "ip-input",
  data() {
    return {
      ipAddress: "",
    };
  },
  methods: {
    formatIpAddress(event) {
      let input = event.target.value.replace(/[^\d.]/g, ""); // Remove non-numeric and non-dot characters
      let parts = input.split(".").filter(Boolean); // Split by dot and remove empty parts

      if (parts.length > 4) {
        parts = parts.slice(0, 4); // Limit to 4 parts
      }

      this.ipAddress = parts
        .map((part) => {
          let num = parseInt(part, 10);
          return isNaN(num) ? "" : Math.min(Math.max(0, num), 255).toString(); // Ensure each part is within the range [0, 255]
        })
        .join(".");
    },
  },
};
</script>

<style scoped></style>

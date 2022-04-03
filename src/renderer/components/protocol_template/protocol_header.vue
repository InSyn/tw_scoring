<template
  ><div
    ref="pdf_header"
    class="pdf_header"
    style="display: flex; flex-direction: column; flex-shrink: 0; justify-content: center; align-items: flex-start"
  >
    <div class="header_image" v-if="results_protocol.assets.header_logo">
      <img
        v-if="
          results_protocol.assets.header_logo.file &&
            results_protocol.assets.header_logo.file.path
        "
        :src="results_protocol.assets.header_logo.file.path"
        style="width: 100%"
        alt=""
      />
    </div>
    <div class="header_competition_info" style="width: 100%;display:flex;">
      <div
        class="left_asset"
        style="width: 8rem;margin: auto 2rem;display:flex;align-items: center; justify-content: center"
      >
        <div
          style="display:flex;align-items: center;justify-content:center; height: 100%;width: 100%"
        >
          <img
            v-if="
              results_protocol.assets.title_logo.file &&
                results_protocol.assets.title_logo.file.path
            "
            :src="results_protocol.assets.title_logo.file.path"
            style="max-width: 100%;max-height: 100%"
            alt=""
          />
        </div>
      </div>
      <div
        class="competition_description"
        style="display: flex; flex-direction: column; align-items: center; margin: auto"
      >
        <div
          style="font-size: 1.4rem; font-weight: bold; line-height: 1.2;text-align: center"
        >
          {{
            results_protocol.title && results_protocol.title.length > 0
              ? results_protocol.title
              : competition.mainData.title.value
          }}
        </div>
        <div
          style="font-size: 1.4rem; font-weight: bold; line-height: 1.2;text-align: center"
        >
          {{
            `${protocol_type} ${(competition.mainData.title.stage.value &&
              competition.mainData.title.stage.value.value) ||
              ""}`
          }}
        </div>
        <div
          v-if="race"
          style="font-size: 1.2rem; font-weight: bold; line-height: 1.2"
        >
          {{ race }}
        </div>
        <div style="font-size: 1.4rem; font-weight: bold; line-height: 1.2">
          {{ competition.mainData.discipline.value }}
        </div>
        <div style="font-size: 1.2rem; line-height: 1.2;text-align: center">
          {{
            `${competition.mainData.location.value} ${competition.mainData
              .country.value && "(" + competition.mainData.country.value + ")"}`
          }}
        </div>
        <div style="font-size: 1.2rem; font-weight: bold; line-height: 1.2">
          {{
            // `${competition.mainData.date.value.toString().split("-")[2]}/${
            //   competition.mainData.date.value.toString().split("-")[1]
            // }/${
            //   competition.mainData.date.value.toString().split("-")[0]
            // }
            `Время старта: ${competition.mainData.date.time}`
          }}
        </div>
      </div>
      <div
        class="right_asset"
        style="height: 8rem;margin: auto 2rem; display:flex;align-items: center; justify-content: center;font-weight: bold;font-size: 4rem"
      >
        {{ competition.mainData.discipline.min }}
      </div>
    </div>
    <div
      :style="page_index !== 0 && { opacity: 0 }"
      style="display:flex; flex-wrap: wrap; align-items: center; margin: 2px 0"
    >
      {{ `Кол-во участников: ${number_of_competitors}` }}
    </div>
  </div>
</template>

<script>
export default {
  name: "protocol_header",
  props: [
    "competition",
    "results_protocol",
    "stageGrid",
    "page_index",
    "protocol_type",
    "race",
    "number_of_competitors"
  ]
};
</script>

<style scoped></style>

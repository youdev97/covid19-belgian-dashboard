package youdev.springrestcs.covid.service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.Arrays;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import com.fasterxml.jackson.core.JsonParseException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;

import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
public class DataServiceImpl {

	@Autowired
	private RestTemplate restTemplate;

	// data sorted by date desc
	private static final String LAST_DATA_URL = "https://data.opendatasoft.com/api/records/1.0/search/?dataset=covid-19-pandemic-belgium-hosp-province@public&rows=1200&sort=date&facet=date&facet=province&facet=region";

	@Cacheable("data")
	@Scheduled(fixedRate = 3600 * 6)
	public String getLastData() throws JsonParseException, IOException {
		String jsonString = callApi();
		ObjectMapper mapper = new ObjectMapper();
		JsonNode root = mapper.readTree(jsonString);
		ArrayList<ObjectNode> brusselsDatas = new ArrayList<>();
		ArrayList<ObjectNode> walloniaDatas = new ArrayList<>();
		ArrayList<ObjectNode> flandersDatas = new ArrayList<>();
		for (JsonNode node : root.get("records")) {
			ObjectNode record = mapper.createObjectNode();
			record.put("recordid", node.get("recordid").asText());
			record.put("province", node.at("/fields/province").asText());
			record.put("region", node.at("/fields/region").asText());
			record.put("new_in", node.at("/fields/new_in").asInt());
			record.put("new_out", node.at("/fields/new_out").asInt());
			record.put("total_in", node.at("/fields/total_in").asInt());
			record.put("total_in_resp", node.at("/fields/total_in_resp").asInt());
			record.put("date", node.at("/fields/date").asText());
			switch (node.at("/fields/region").asText()) {
			case "Brussels":
				brusselsDatas.add(record);
				break;
			case "Wallonia":
				walloniaDatas.add(record);
				break;
			case "Flanders":
				flandersDatas.add(record);
				break;
			}
		}
		ObjectNode datas = mapper.createObjectNode();
		datas.putArray("Brussels").addAll(brusselsDatas);
		datas.putArray("Flanders").addAll(flandersDatas);
		datas.putArray("Wallonia").addAll(walloniaDatas);
		jsonString = datas.toPrettyString();
		return jsonString;
	}

	public String callApi() {
		String jsonString = "";
		try {
			HttpHeaders headers = new HttpHeaders();
			headers.setAccept(Arrays.asList(MediaType.APPLICATION_JSON));
			HttpEntity<String> entity = new HttpEntity<String>(headers);
			jsonString = restTemplate.exchange(LAST_DATA_URL, HttpMethod.GET, entity, String.class).getBody();
		} catch (Exception e) {
			try {
				log.warn("Exception trying to consume the API. The static data file should be loaded");
				jsonString = new String(Files.readAllBytes(Paths.get("src/main/resources/static/data/data.json")));
				log.info("The static data file loaded successfully");
			} catch (Exception e2) {
				log.warn("Exception trying to load the satic data file");
			}
		}
		return jsonString;
	}

}

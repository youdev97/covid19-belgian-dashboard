package youdev.covid19.dahsboard.service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.CacheManager;
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
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;

import lombok.extern.slf4j.Slf4j;
import youdev.covid19.dahsboard.model.Record;

@Slf4j
@Service
public class DataServiceImpl {

	@Autowired
	private RestTemplate restTemplate;
	
	@Autowired
	CacheManager cacheManager;

	// data sorted by date desc
	private static final String LAST_DATA_URL = "https://data.opendatasoft.com/api/records/1.0/search/?dataset=covid-19-pandemic-belgium-hosp-province@public&rows=1200&sort=date&facet=date&facet=province&facet=region";

	@Cacheable("data")
	public String getLastData() throws JsonParseException, IOException {
		String jsonString = callApi();
		ObjectMapper mapper = new ObjectMapper();
		JsonNode root = mapper.readTree(jsonString);
		List<Record> brusselsDatas = new ArrayList<>();
		List<Record> walloniaDatas = new ArrayList<>();
		List<Record> flandersDatas = new ArrayList<>();
		for (JsonNode node : root.get("records")) {
			Record record = new Record();
			record = mapper.readValue(node.get("fields").toString(), Record.class);
			record.setRecordId(node.get("recordid").asText());
			switch (record.getRegion()) {
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
		datas.putArray("Brussels").addAll((ArrayNode)mapper.valueToTree(brusselsDatas));
		datas.putArray("Flanders").addAll((ArrayNode)mapper.valueToTree(flandersDatas));
		datas.putArray("Wallonia").addAll((ArrayNode)mapper.valueToTree(walloniaDatas));
		jsonString = datas.toPrettyString();
		return jsonString;
	}

	/**
	 * Call the API specified in the constant
	 * @return JSON response
	 */
	private String callApi() {
		log.info("callApi Method - START");
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
	
	// clear cache every 12 hours
	@Scheduled(fixedRate = 12 * 3600 * 1000)
	public void refreshAllcachesAtIntervals() {
		cacheManager.getCacheNames().stream()
	      .forEach(cacheName -> cacheManager.getCache(cacheName).clear());
		log.info("Cache evicted");
	}

}
